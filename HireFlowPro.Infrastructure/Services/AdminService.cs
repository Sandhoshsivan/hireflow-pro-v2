using System.Security.Cryptography;
using System.Text;
using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;
using HireFlowPro.Core.Interfaces;
using HireFlowPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HireFlowPro.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly AuthService _authService;

    public AdminService(AppDbContext db, AuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalApps = await _db.Applications.CountAsync();

        var totalRevenue = await _db.Payments
            .Where(p => p.Status == PaymentStatus.Succeeded)
            .SumAsync(p => p.Amount);

        var byPlan = await _db.Users
            .GroupBy(u => u.Plan)
            .Select(g => new { Plan = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Plan, x => x.Count);

        var byStatus = await _db.Applications
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);

        // Signups trend: last 30 days grouped by day
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var signupsTrend = await _db.Users
            .Where(u => u.CreatedAt >= thirtyDaysAgo)
            .GroupBy(u => u.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TrendDataPoint
            {
                Period = g.Key.ToString("yyyy-MM-dd"),
                Count = g.Count()
            })
            .ToListAsync();

        // Revenue trend: last 12 months
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
        var revenueData = await _db.Payments
            .Where(p => p.Status == PaymentStatus.Succeeded && p.CreatedAt >= twelveMonthsAgo)
            .ToListAsync();

        var revenueTrend = revenueData
            .GroupBy(p => p.CreatedAt.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new TrendDataPoint
            {
                Period = g.Key,
                Count = (int)g.Sum(p => p.Amount)
            })
            .ToList();

        // Top users by application count
        var topUsers = await _db.Users
            .OrderByDescending(u => u.Applications.Count)
            .Take(10)
            .Select(u => new TopUserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                ApplicationCount = u.Applications.Count
            })
            .ToListAsync();

        // Recent users
        var recentUsers = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(10)
            .Select(u => new RecentUserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Plan = u.Plan,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalApplications = totalApps,
            TotalRevenue = totalRevenue,
            ByPlan = byPlan,
            ByStatus = byStatus,
            SignupsTrend = signupsTrend,
            RevenueTrend = revenueTrend,
            TopUsers = topUsers,
            RecentUsers = recentUsers
        };
    }

    public async Task<UserListResponse> ListUsersAsync(UserListRequest request)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(u =>
                u.Name.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Plan))
            query = query.Where(u => u.Plan == request.Plan);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserListItemDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Plan = u.Plan,
                IsAdmin = u.IsAdmin,
                IsBlocked = u.IsBlocked,
                ApplicationCount = u.Applications.Count,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new UserListResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<UserDetailDto> GetUserAsync(int userId)
    {
        var user = await _db.Users
            .Include(u => u.Applications.OrderByDescending(a => a.CreatedAt).Take(5))
            .Include(u => u.Payments.OrderByDescending(p => p.CreatedAt).Take(10))
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new InvalidOperationException("User not found.");

        var appCount = await _db.Applications.CountAsync(a => a.UserId == userId);

        return new UserDetailDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            RoleTitle = user.RoleTitle,
            Plan = user.Plan,
            PlanStartedAt = user.PlanStartedAt,
            StripeCustomerId = user.StripeCustomerId,
            IsAdmin = user.IsAdmin,
            IsBlocked = user.IsBlocked,
            CreatedAt = user.CreatedAt,
            ResumeUrl = user.ResumeUrl,
            ApplicationCount = appCount,
            RecentPayments = user.Payments.Select(p => new PaymentDto
            {
                Id = p.Id,
                Plan = p.Plan,
                Amount = p.Amount,
                Currency = p.Currency,
                Status = p.Status,
                CreatedAt = p.CreatedAt
            }).ToList(),
            RecentApplications = user.Applications.Select(a => new ApplicationSummaryDto
            {
                Id = a.Id,
                JobTitle = a.JobTitle,
                Company = a.Company,
                Location = a.Location,
                Status = a.Status,
                Priority = a.Priority,
                SalaryRange = a.SalaryRange,
                MatchScore = a.MatchScore,
                AppliedDate = a.AppliedDate,
                FollowUpDate = a.FollowUpDate,
                LastActivityDate = a.LastActivityDate,
                CreatedAt = a.CreatedAt
            }).ToList()
        };
    }

    public async Task<UserDetailDto> UpdateUserAsync(int adminUserId, int userId, UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        if (request.Name is not null) user.Name = request.Name.Trim();
        if (request.Email is not null) user.Email = request.Email.Trim().ToLowerInvariant();
        if (request.RoleTitle is not null) user.RoleTitle = request.RoleTitle.Trim();
        if (request.Plan is not null)
        {
            user.Plan = request.Plan;
            user.PlanStartedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return await GetUserAsync(userId);
    }

    public async Task DeleteUserAsync(int adminUserId, int userId)
    {
        if (adminUserId == userId)
            throw new InvalidOperationException("You cannot delete your own account.");

        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    public async Task<UserDetailDto> SetPlanAsync(int userId, SetPlanRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        user.Plan = request.Plan;
        user.PlanStartedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetUserAsync(userId);
    }

    public async Task<UserDetailDto> ToggleBlockAsync(int adminUserId, int userId)
    {
        if (adminUserId == userId)
            throw new InvalidOperationException("You cannot block your own account.");

        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        user.IsBlocked = !user.IsBlocked;
        await _db.SaveChangesAsync();

        return await GetUserAsync(userId);
    }

    public async Task<UserDetailDto> ToggleAdminAsync(int adminUserId, int userId)
    {
        if (adminUserId == userId)
            throw new InvalidOperationException("You cannot change your own admin status.");

        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        user.IsAdmin = !user.IsAdmin;
        await _db.SaveChangesAsync();

        return await GetUserAsync(userId);
    }

    public async Task<ImpersonateResponse> ImpersonateAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        var token = _authService.GenerateJwtToken(user, impersonating: true);
        var appCount = await _db.Applications.CountAsync(a => a.UserId == userId);

        return new ImpersonateResponse
        {
            Token = token,
            User = new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                RoleTitle = user.RoleTitle,
                Plan = user.Plan,
                PlanStartedAt = user.PlanStartedAt,
                IsAdmin = user.IsAdmin,
                CreatedAt = user.CreatedAt,
                ResumeUrl = user.ResumeUrl,
                ApplicationCount = appCount
            }
        };
    }

    public async Task ResetPasswordAsync(int userId, AdminResetPasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        // Reuse the password hashing from AuthService via static helper
        user.PasswordHash = HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();
    }

    // ---- Password hashing (mirrors AuthService) ----

    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;
    private static readonly HashAlgorithmName _hashAlgorithm = HashAlgorithmName.SHA256;

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            Iterations,
            _hashAlgorithm,
            HashSize
        );

        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
}

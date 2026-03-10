using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;
using HireFlowPro.Core.Interfaces;
using HireFlowPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HireFlowPro.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;
    private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == emailLower))
            throw new InvalidOperationException("A user with this email already exists.");

        var isFirstUser = !await _db.Users.AnyAsync();

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = emailLower,
            PasswordHash = HashPassword(request.Password),
            IsAdmin = isFirstUser,
            Plan = PlanType.Free,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var profile = await BuildProfileAsync(user);

        return new AuthResponse { Token = token, User = profile };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == emailLower)
            ?? throw new InvalidOperationException("Invalid email or password.");

        if (user.IsBlocked)
            throw new InvalidOperationException("Your account has been blocked. Contact support.");

        if (!VerifyPassword(request.Password, user.PasswordHash))
            throw new InvalidOperationException("Invalid email or password.");

        var token = GenerateJwtToken(user);
        var profile = await BuildProfileAsync(user);

        return new AuthResponse { Token = token, User = profile };
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string baseUrl)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == emailLower);

        // Always return success message to prevent email enumeration
        var response = new ForgotPasswordResponse
        {
            Message = "If an account with that email exists, a password reset link has been sent."
        };

        if (user is null)
            return response;

        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');

        var passwordReset = new PasswordReset
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.PasswordResets.Add(passwordReset);
        await _db.SaveChangesAsync();

        response.ResetLink = $"{baseUrl.TrimEnd('/')}/reset-password?token={token}";
        return response;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var reset = await _db.PasswordResets
            .Include(pr => pr.User)
            .FirstOrDefaultAsync(pr => pr.Token == request.Token)
            ?? throw new InvalidOperationException("Invalid or expired reset token.");

        if (reset.IsUsed)
            throw new InvalidOperationException("This reset token has already been used.");

        if (reset.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("This reset token has expired.");

        reset.User.PasswordHash = HashPassword(request.NewPassword);
        reset.IsUsed = true;

        await _db.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect.");

        user.PasswordHash = HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();
    }

    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        return await BuildProfileAsync(user);
    }

    // ---- JWT ----

    public string GenerateJwtToken(User user, bool impersonating = false)
    {
        var key = _config["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("userId", user.Id.ToString()),
            new("isAdmin", user.IsAdmin.ToString().ToLowerInvariant())
        };

        if (impersonating)
            claims.Add(new Claim("impersonating", "true"));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ---- Password hashing (PBKDF2-SHA256) ----

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            Iterations,
            HashAlgorithm,
            HashSize
        );

        // Format: iterations.salt.hash (all base64)
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string passwordHash)
    {
        var parts = passwordHash.Split('.');
        if (parts.Length != 3) return false;

        if (!int.TryParse(parts[0], out var iterations)) return false;
        var salt = Convert.FromBase64String(parts[1]);
        var storedHash = Convert.FromBase64String(parts[2]);

        var computedHash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations,
            HashAlgorithm,
            storedHash.Length
        );

        return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
    }

    // ---- Helpers ----

    private async Task<UserProfileDto> BuildProfileAsync(User user)
    {
        var appCount = await _db.Applications.CountAsync(a => a.UserId == user.Id);

        return new UserProfileDto
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
        };
    }
}

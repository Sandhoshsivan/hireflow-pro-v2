using System.Globalization;
using System.Text;
using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;
using HireFlowPro.Core.Interfaces;
using HireFlowPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HireFlowPro.Infrastructure.Services;

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _db;

    public ApplicationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ApplicationListResponse> GetAllAsync(int userId, ApplicationListRequest request)
    {
        var query = _db.Applications
            .Where(a => a.UserId == userId)
            .AsQueryable();

        // Filter by status (case-insensitive to support lowercase from frontend)
        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(a => a.Status.ToLower() == request.Status.ToLower());

        // Search across company, job title, and notes
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(a =>
                a.Company.ToLower().Contains(search) ||
                a.JobTitle.ToLower().Contains(search) ||
                (a.Notes != null && a.Notes.ToLower().Contains(search))
            );
        }

        var totalCount = await query.CountAsync();

        // Sort
        query = request.Sort switch
        {
            "date_asc" => query.OrderBy(a => a.CreatedAt),
            "company" => query.OrderBy(a => a.Company).ThenByDescending(a => a.CreatedAt),
            "salary" => query.OrderByDescending(a => a.SalaryRange).ThenByDescending(a => a.CreatedAt),
            "activity" => query.OrderByDescending(a => a.LastActivityDate),
            _ => query.OrderByDescending(a => a.CreatedAt) // date_desc default
        };

        // Paginate
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new ApplicationSummaryDto
            {
                Id = a.Id,
                JobTitle = a.JobTitle,
                Company = a.Company,
                Location = a.Location,
                Status = a.Status,
                Priority = a.Priority,
                SalaryRange = a.SalaryRange,
                Source = a.Source,
                MatchScore = a.MatchScore,
                AppliedDate = a.AppliedDate,
                FollowUpDate = a.FollowUpDate,
                LastActivityDate = a.LastActivityDate,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return new ApplicationListResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<ApplicationDetailDto> GetByIdAsync(int userId, int applicationId)
    {
        var app = await _db.Applications
            .Include(a => a.Timelines.OrderByDescending(t => t.CreatedAt))
            .Include(a => a.Contacts)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new InvalidOperationException("Application not found.");

        return MapToDetail(app);
    }

    public async Task<ApplicationDetailDto> CreateAsync(int userId, CreateApplicationRequest request)
    {
        // Check plan limit
        var user = await _db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        if (!user.IsAdmin)
        {
            var currentCount = await _db.Applications.CountAsync(a => a.UserId == userId);
            var limit = PlanType.GetApplicationLimit(user.Plan);

            if (currentCount >= limit)
                throw new InvalidOperationException(
                    $"You have reached the application limit ({limit}) for the {user.Plan} plan. Upgrade to add more.");
        }

        var now = DateTime.UtcNow;
        var app = new Application
        {
            UserId = userId,
            JobTitle = request.JobTitle.Trim(),
            Company = request.Company.Trim(),
            Location = request.Location?.Trim(),
            JobUrl = request.JobUrl?.Trim(),
            SalaryRange = request.SalaryRange?.Trim(),
            Source = request.Source?.Trim(),
            Status = request.Status,
            Priority = request.Priority,
            Notes = request.Notes,
            JobDescription = request.JobDescription,
            CoverLetter = request.CoverLetter,
            AppliedDate = request.AppliedDate,
            InterviewDate = request.InterviewDate,
            FollowUpDate = request.FollowUpDate,
            LastActivityDate = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Applications.Add(app);

        // Auto-add timeline entry for creation
        var timeline = new Timeline
        {
            Application = app,
            FromStatus = string.Empty,
            ToStatus = app.Status,
            Note = "Application created",
            CreatedAt = now
        };
        _db.Timelines.Add(timeline);

        await _db.SaveChangesAsync();

        // Reload with navigation properties
        return await GetByIdAsync(userId, app.Id);
    }

    public async Task<ApplicationDetailDto> UpdateAsync(int userId, int applicationId, UpdateApplicationRequest request)
    {
        var app = await _db.Applications
            .Include(a => a.Timelines)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new InvalidOperationException("Application not found.");

        var now = DateTime.UtcNow;
        var oldStatus = app.Status;

        // Update fields if provided
        if (request.JobTitle is not null) app.JobTitle = request.JobTitle.Trim();
        if (request.Company is not null) app.Company = request.Company.Trim();
        if (request.Location is not null) app.Location = request.Location.Trim();
        if (request.JobUrl is not null) app.JobUrl = request.JobUrl.Trim();
        if (request.SalaryRange is not null) app.SalaryRange = request.SalaryRange.Trim();
        if (request.Source is not null) app.Source = request.Source.Trim();
        if (request.Priority is not null) app.Priority = request.Priority;
        if (request.Notes is not null) app.Notes = request.Notes;
        if (request.JobDescription is not null) app.JobDescription = request.JobDescription;
        if (request.CoverLetter is not null) app.CoverLetter = request.CoverLetter;
        if (request.AppliedDate.HasValue) app.AppliedDate = request.AppliedDate;
        if (request.InterviewDate.HasValue) app.InterviewDate = request.InterviewDate;
        if (request.FollowUpDate.HasValue) app.FollowUpDate = request.FollowUpDate;

        // Track status change in timeline
        if (request.Status is not null && request.Status != oldStatus)
        {
            app.Status = request.Status;
            _db.Timelines.Add(new Timeline
            {
                ApplicationId = app.Id,
                FromStatus = oldStatus,
                ToStatus = request.Status,
                Note = $"Status changed from {oldStatus} to {request.Status}",
                CreatedAt = now
            });
        }

        app.LastActivityDate = now;
        app.UpdatedAt = now;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(userId, app.Id);
    }

    public async Task<ApplicationDetailDto> UpdateStatusAsync(int userId, int applicationId, UpdateStatusRequest request)
    {
        var app = await _db.Applications
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new InvalidOperationException("Application not found.");

        var now = DateTime.UtcNow;
        var oldStatus = app.Status;

        if (oldStatus == request.Status)
            return await GetByIdAsync(userId, applicationId);

        app.Status = request.Status;
        app.LastActivityDate = now;
        app.UpdatedAt = now;

        _db.Timelines.Add(new Timeline
        {
            ApplicationId = app.Id,
            FromStatus = oldStatus,
            ToStatus = request.Status,
            Note = request.Note ?? $"Status changed from {oldStatus} to {request.Status}",
            CreatedAt = now
        });

        await _db.SaveChangesAsync();
        return await GetByIdAsync(userId, applicationId);
    }

    public async Task DeleteAsync(int userId, int applicationId)
    {
        var app = await _db.Applications
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new InvalidOperationException("Application not found.");

        _db.Applications.Remove(app);
        await _db.SaveChangesAsync();
    }

    public async Task<ApplicationStatsDto> GetStatsAsync(int userId)
    {
        var apps = await _db.Applications
            .Where(a => a.UserId == userId)
            .ToListAsync();

        var total = apps.Count;

        // By status counts
        var byStatus = apps
            .GroupBy(a => a.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        // Ensure all statuses appear
        foreach (var status in ApplicationStatus.All)
        {
            byStatus.TryAdd(status, 0);
        }

        // Response rate: apps that got interview, offer, or rejection vs total applied
        var appliedOrBeyond = apps.Count(a =>
            a.Status != ApplicationStatus.Saved);
        var gotResponse = apps.Count(a =>
            a.Status is ApplicationStatus.Interview or
            ApplicationStatus.Offer or
            ApplicationStatus.Rejected);
        var responseRate = appliedOrBeyond > 0
            ? Math.Round((double)gotResponse / appliedOrBeyond * 100, 1)
            : 0;

        // Trend: applications created per week over last 12 weeks
        var twelveWeeksAgo = DateTime.UtcNow.AddDays(-84);
        var trend = apps
            .Where(a => a.CreatedAt >= twelveWeeksAgo)
            .GroupBy(a => CultureInfo.InvariantCulture.Calendar
                .GetWeekOfYear(a.CreatedAt, CalendarWeekRule.FirstDay, DayOfWeek.Monday))
            .OrderBy(g => g.Key)
            .Select(g => new TrendDataPoint
            {
                Period = $"W{g.Key}",
                Count = g.Count()
            })
            .ToList();

        // Upcoming follow-ups
        var followUps = apps
            .Where(a => a.FollowUpDate.HasValue && a.FollowUpDate.Value >= DateTime.UtcNow)
            .OrderBy(a => a.FollowUpDate)
            .Take(10)
            .Select(a => new ApplicationSummaryDto
            {
                Id = a.Id,
                JobTitle = a.JobTitle,
                Company = a.Company,
                Location = a.Location,
                Status = a.Status,
                Priority = a.Priority,
                SalaryRange = a.SalaryRange,
                Source = a.Source,
                MatchScore = a.MatchScore,
                AppliedDate = a.AppliedDate,
                FollowUpDate = a.FollowUpDate,
                LastActivityDate = a.LastActivityDate,
                CreatedAt = a.CreatedAt
            })
            .ToList();

        return new ApplicationStatsDto
        {
            ByStatus = byStatus,
            ResponseRate = responseRate,
            BySource = apps
                .Where(a => !string.IsNullOrEmpty(a.Source))
                .GroupBy(a => a.Source!)
                .ToDictionary(g => g.Key, g => g.Count()),
            Trend = trend,
            UpcomingFollowUps = followUps,
            TotalApplications = total
        };
    }

    public async Task<string> ExportCsvAsync(int userId)
    {
        var apps = await _db.Applications
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Id,JobTitle,Company,Location,Status,Priority,SalaryRange,AppliedDate,InterviewDate,FollowUpDate,MatchScore,JobUrl,Notes,CreatedAt");

        foreach (var a in apps)
        {
            sb.AppendLine(string.Join(",",
                a.Id,
                CsvEscape(a.JobTitle),
                CsvEscape(a.Company),
                CsvEscape(a.Location ?? string.Empty),
                a.Status,
                a.Priority,
                CsvEscape(a.SalaryRange ?? string.Empty),
                a.AppliedDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                a.InterviewDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                a.FollowUpDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                a.MatchScore?.ToString() ?? string.Empty,
                CsvEscape(a.JobUrl ?? string.Empty),
                CsvEscape(a.Notes ?? string.Empty),
                a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            ));
        }

        return sb.ToString();
    }

    public async Task<IEnumerable<TimelineDto>> GetTimelineAsync(int userId, int applicationId)
    {
        var app = await _db.Applications
            .Include(a => a.Timelines.OrderByDescending(t => t.CreatedAt))
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new InvalidOperationException("Application not found.");

        return app.Timelines.Select(t => new TimelineDto
        {
            Id = t.Id,
            FromStatus = t.FromStatus,
            ToStatus = t.ToStatus,
            Note = t.Note,
            CreatedAt = t.CreatedAt
        });
    }

    public async Task<IEnumerable<ContactDto>> GetContactsAsync(int userId, int applicationId)
    {
        var app = await _db.Applications
            .Include(a => a.Contacts)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId)
            ?? throw new InvalidOperationException("Application not found.");

        return app.Contacts.Select(c => new ContactDto
        {
            Id = c.Id,
            Name = c.Name,
            Title = c.Title,
            Email = c.Email,
            Phone = c.Phone,
            LinkedInUrl = c.LinkedInUrl,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt
        });
    }

    // ---- Helpers ----

    private static ApplicationDetailDto MapToDetail(Application app) => new()
    {
        Id = app.Id,
        UserId = app.UserId,
        JobTitle = app.JobTitle,
        Company = app.Company,
        Location = app.Location,
        JobUrl = app.JobUrl,
        SalaryRange = app.SalaryRange,
        Source = app.Source,
        Status = app.Status,
        Priority = app.Priority,
        Notes = app.Notes,
        JobDescription = app.JobDescription,
        CoverLetter = app.CoverLetter,
        MatchScore = app.MatchScore,
        MissingKeywords = app.MissingKeywords,
        AppliedDate = app.AppliedDate,
        InterviewDate = app.InterviewDate,
        FollowUpDate = app.FollowUpDate,
        LastActivityDate = app.LastActivityDate,
        CreatedAt = app.CreatedAt,
        UpdatedAt = app.UpdatedAt,
        Timelines = app.Timelines.Select(t => new TimelineDto
        {
            Id = t.Id,
            FromStatus = t.FromStatus,
            ToStatus = t.ToStatus,
            Note = t.Note,
            CreatedAt = t.CreatedAt
        }).ToList(),
        Contacts = app.Contacts.Select(c => new ContactDto
        {
            Id = c.Id,
            Name = c.Name,
            Title = c.Title,
            Email = c.Email,
            Phone = c.Phone,
            LinkedInUrl = c.LinkedInUrl,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt
        }).ToList()
    };

    private static string CsvEscape(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}

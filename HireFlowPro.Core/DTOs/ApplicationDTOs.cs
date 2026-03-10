namespace HireFlowPro.Core.DTOs;

public class ApplicationListRequest
{
    public string? Status { get; set; }
    public string? Search { get; set; }
    public string Sort { get; set; } = "date_desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ApplicationListResponse
{
    public List<ApplicationSummaryDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class ApplicationSummaryDto
{
    public int Id { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? SalaryRange { get; set; }
    public int? MatchScore { get; set; }
    public DateTime? AppliedDate { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public DateTime LastActivityDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplicationDetailDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? JobUrl { get; set; }
    public string? SalaryRange { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? JobDescription { get; set; }
    public string? CoverLetter { get; set; }
    public int? MatchScore { get; set; }
    public string? MissingKeywords { get; set; }
    public DateTime? AppliedDate { get; set; }
    public DateTime? InterviewDate { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public DateTime LastActivityDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TimelineDto> Timelines { get; set; } = [];
    public List<ContactDto> Contacts { get; set; } = [];
}

public class CreateApplicationRequest
{
    public string JobTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? JobUrl { get; set; }
    public string? SalaryRange { get; set; }
    public string Status { get; set; } = "Saved";
    public string Priority { get; set; } = "Medium";
    public string? Notes { get; set; }
    public string? JobDescription { get; set; }
    public string? CoverLetter { get; set; }
    public DateTime? AppliedDate { get; set; }
    public DateTime? InterviewDate { get; set; }
    public DateTime? FollowUpDate { get; set; }
}

public class UpdateApplicationRequest
{
    public string? JobTitle { get; set; }
    public string? Company { get; set; }
    public string? Location { get; set; }
    public string? JobUrl { get; set; }
    public string? SalaryRange { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Notes { get; set; }
    public string? JobDescription { get; set; }
    public string? CoverLetter { get; set; }
    public DateTime? AppliedDate { get; set; }
    public DateTime? InterviewDate { get; set; }
    public DateTime? FollowUpDate { get; set; }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class TimelineDto
{
    public int Id { get; set; }
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ContactDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplicationStatsDto
{
    public Dictionary<string, int> ByStatus { get; set; } = [];
    public double ResponseRate { get; set; }
    public Dictionary<string, int> BySource { get; set; } = [];
    public List<TrendDataPoint> Trend { get; set; } = [];
    public List<ApplicationSummaryDto> UpcomingFollowUps { get; set; } = [];
    public int TotalApplications { get; set; }
}

public class TrendDataPoint
{
    public string Period { get; set; } = string.Empty;
    public int Count { get; set; }
}

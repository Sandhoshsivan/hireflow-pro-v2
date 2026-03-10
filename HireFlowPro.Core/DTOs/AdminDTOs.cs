namespace HireFlowPro.Core.DTOs;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalApplications { get; set; }
    public decimal TotalRevenue { get; set; }
    public Dictionary<string, int> ByPlan { get; set; } = [];
    public Dictionary<string, int> ByStatus { get; set; } = [];
    public List<TrendDataPoint> SignupsTrend { get; set; } = [];
    public List<TrendDataPoint> RevenueTrend { get; set; } = [];
    public List<TopUserDto> TopUsers { get; set; } = [];
    public List<RecentUserDto> RecentUsers { get; set; } = [];
}

public class TopUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int ApplicationCount { get; set; }
}

public class RecentUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UserListRequest
{
    public string? Search { get; set; }
    public string? Plan { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class UserListResponse
{
    public List<UserListItemDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class UserListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public bool IsBlocked { get; set; }
    public int ApplicationCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoleTitle { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public DateTime? PlanStartedAt { get; set; }
    public string? StripeCustomerId { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsBlocked { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ResumeUrl { get; set; }
    public int ApplicationCount { get; set; }
    public List<PaymentDto> RecentPayments { get; set; } = [];
    public List<ApplicationSummaryDto> RecentApplications { get; set; } = [];
}

public class PaymentDto
{
    public int Id { get; set; }
    public string Plan { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? RoleTitle { get; set; }
    public string? Plan { get; set; }
}

public class SetPlanRequest
{
    public string Plan { get; set; } = string.Empty;
}

public class AdminResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

public class ImpersonateResponse
{
    public string Token { get; set; } = string.Empty;
    public UserProfileDto User { get; set; } = null!;
}

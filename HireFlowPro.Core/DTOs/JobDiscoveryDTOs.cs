namespace HireFlowPro.Core.DTOs;

public class JobDiscoveryResult
{
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string? Salary { get; set; }
    public string? Description { get; set; }
    public List<string> Tags { get; set; } = [];
    public DateTime? PostedAt { get; set; }
}

public class JobDiscoveryResponse
{
    public List<JobDiscoveryResult> Jobs { get; set; } = [];
    public int Total { get; set; }
    public int Page { get; set; }
}

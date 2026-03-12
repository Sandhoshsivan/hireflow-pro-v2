namespace HireFlowPro.Core.Interfaces;

public interface IAIQuotaService
{
    Task<AIQuotaStatus> CheckQuotaAsync(int userId);
    Task TrackUsageAsync(int userId, string feature);
}

public class AIQuotaStatus
{
    public bool Allowed { get; set; }
    public int Used { get; set; }
    public int Limit { get; set; }
    public int Remaining { get; set; }
    public string Plan { get; set; } = string.Empty;
}

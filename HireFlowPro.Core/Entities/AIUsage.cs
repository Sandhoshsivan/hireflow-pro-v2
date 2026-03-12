using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HireFlowPro.Core.Entities;

public class AIUsage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required, MaxLength(50)]
    public string Feature { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}

public static class AIFeature
{
    public const string AnalyzeMatch = "AnalyzeMatch";
    public const string CareerAdvice = "CareerAdvice";
    public const string Chat = "Chat";
    public const string TailorResume = "TailorResume";
}

public static class AIQuotaLimits
{
    /// <summary>
    /// Monthly AI usage limits per plan. -1 means unlimited.
    /// </summary>
    public static int GetMonthlyLimit(string plan) => plan switch
    {
        PlanType.Free => 5,
        PlanType.Pro => 90,
        PlanType.Premium => -1, // unlimited
        _ => 5
    };
}

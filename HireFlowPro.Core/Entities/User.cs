using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HireFlowPro.Core.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    public string RoleTitle { get; set; } = "User";

    [Required, MaxLength(20)]
    public string Plan { get; set; } = PlanType.Free;

    public DateTime? PlanStartedAt { get; set; }

    [MaxLength(255)]
    public string? StripeCustomerId { get; set; }

    public bool IsAdmin { get; set; } = false;

    public bool IsBlocked { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(500)]
    public string? ResumeUrl { get; set; }

    // Navigation properties
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<PasswordReset> PasswordResets { get; set; } = new List<PasswordReset>();
    public ICollection<AIUsage> AIUsages { get; set; } = new List<AIUsage>();
    public ResumeProfile? ResumeProfile { get; set; }
}

public static class PlanType
{
    public const string Free = "Free";
    public const string Pro = "Pro";
    public const string Premium = "Premium";

    public static int GetApplicationLimit(string plan) => plan switch
    {
        Free => 5,
        Pro => int.MaxValue,
        Premium => int.MaxValue,
        _ => 5
    };

    public static decimal GetPrice(string plan) => plan switch
    {
        Pro => 9.00m,
        Premium => 19.00m,
        _ => 0.00m
    };
}

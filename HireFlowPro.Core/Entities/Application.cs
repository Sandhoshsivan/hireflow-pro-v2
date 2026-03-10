using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HireFlowPro.Core.Entities;

public class Application
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required, MaxLength(200)]
    public string JobTitle { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Company { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? JobUrl { get; set; }

    [MaxLength(100)]
    public string? SalaryRange { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = ApplicationStatus.Saved;

    [Required, MaxLength(10)]
    public string Priority { get; set; } = ApplicationPriority.Medium;

    [Column(TypeName = "text")]
    public string? Notes { get; set; }

    [Column(TypeName = "text")]
    public string? JobDescription { get; set; }

    [Column(TypeName = "text")]
    public string? CoverLetter { get; set; }

    /// <summary>
    /// AI-computed match score (0-100) between resume and job description.
    /// </summary>
    public int? MatchScore { get; set; }

    /// <summary>
    /// JSON array of keywords missing from resume relative to job description.
    /// </summary>
    [Column(TypeName = "text")]
    public string? MissingKeywords { get; set; }

    public DateTime? AppliedDate { get; set; }

    public DateTime? InterviewDate { get; set; }

    public DateTime? FollowUpDate { get; set; }

    public DateTime LastActivityDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<Timeline> Timelines { get; set; } = new List<Timeline>();
    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
}

public static class ApplicationStatus
{
    public const string Saved = "Saved";
    public const string Applied = "Applied";
    public const string Interview = "Interview";
    public const string Offer = "Offer";
    public const string Rejected = "Rejected";
    public const string Ghosted = "Ghosted";

    public static readonly string[] All =
    [
        Saved, Applied, Interview, Offer, Rejected, Ghosted
    ];
}

public static class ApplicationPriority
{
    public const string High = "High";
    public const string Medium = "Medium";
    public const string Low = "Low";

    public static readonly string[] All = [High, Medium, Low];
}

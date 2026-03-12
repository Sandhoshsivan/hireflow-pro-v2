using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HireFlowPro.Core.Entities;

public class ResumeProfile
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Summary { get; set; }

    /// <summary>JSON array of skill strings, e.g. ["C#", ".NET", "Azure"]</summary>
    public string? Skills { get; set; }

    /// <summary>JSON array of experience objects: [{company, title, startDate, endDate, description}]</summary>
    public string? Experience { get; set; }

    /// <summary>JSON array of education objects: [{institution, degree, field, year}]</summary>
    public string? Education { get; set; }

    /// <summary>JSON array of certification strings</summary>
    public string? Certifications { get; set; }

    /// <summary>JSON array of language strings</summary>
    public string? Languages { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? LinkedIn { get; set; }

    [MaxLength(500)]
    public string? Portfolio { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}

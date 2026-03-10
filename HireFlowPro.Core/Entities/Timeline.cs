using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HireFlowPro.Core.Entities;

public class Timeline
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ApplicationId { get; set; }

    [Required, MaxLength(20)]
    public string FromStatus { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string ToStatus { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(ApplicationId))]
    public Application Application { get; set; } = null!;
}

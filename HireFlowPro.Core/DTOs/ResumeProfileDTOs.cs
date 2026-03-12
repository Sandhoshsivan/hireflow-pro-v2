namespace HireFlowPro.Core.DTOs;

public class ResumeProfileDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Summary { get; set; }
    public string? Skills { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? Certifications { get; set; }
    public string? Languages { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Location { get; set; }
    public string? LinkedIn { get; set; }
    public string? Portfolio { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveResumeProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Summary { get; set; }
    public string? Skills { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? Certifications { get; set; }
    public string? Languages { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Location { get; set; }
    public string? LinkedIn { get; set; }
    public string? Portfolio { get; set; }
}

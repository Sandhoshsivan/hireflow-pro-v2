namespace HireFlowPro.Core.DTOs;

public class AnalyzeMatchRequest
{
    public string JobDescription { get; set; } = string.Empty;
    public string ResumeText { get; set; } = string.Empty;
}

public class AnalyzeMatchResponse
{
    public int MatchScore { get; set; }
    public List<string> MissingKeywords { get; set; } = [];
    public List<string> Suggestions { get; set; } = [];
}

public class CareerAdviceRequest
{
    public string Prompt { get; set; } = string.Empty;
    public string? CurrentRole { get; set; }
    public string? TargetRole { get; set; }
    public string? Experience { get; set; }
}

public class CareerAdviceResponse
{
    public string Response { get; set; } = string.Empty;
}

public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
    public List<ChatHistoryItem>? History { get; set; }
}

public class ChatHistoryItem
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class TailorResumeRequest
{
    public string JobDescription { get; set; } = string.Empty;
    /// <summary>
    /// If empty, will be loaded from user's ResumeProfile.
    /// </summary>
    public string? ResumeData { get; set; }
}

public class TailorResumeResponse
{
    public string TailoredSummary { get; set; } = string.Empty;
    public List<string> HighlightedSkills { get; set; } = [];
    public List<string> SuggestedBulletPoints { get; set; } = [];
    public string CoverLetterDraft { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public List<string> KeywordsToInclude { get; set; } = [];
}

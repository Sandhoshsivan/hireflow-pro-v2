using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HireFlowPro.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<AIService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public AIService(HttpClient httpClient, IConfiguration config, ILogger<AIService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task<AnalyzeMatchResponse> AnalyzeMatchAsync(AnalyzeMatchRequest request)
    {
        var prompt = $"""
            Analyze the match between this job description and resume.
            Return a JSON object with exactly these fields:
            - "matchScore": integer 0-100 indicating how well the resume matches
            - "missingKeywords": array of strings listing important keywords/skills from the job description that are missing from the resume
            - "suggestions": array of strings with actionable improvement suggestions

            Job Description:
            {request.JobDescription}

            Resume:
            {request.ResumeText}

            Return ONLY valid JSON, no markdown or explanation.
            """;

        try
        {
            var responseText = await SendToAIAsync(prompt);
            var parsed = ParseAnalyzeMatchResponse(responseText);
            return parsed;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI match analysis failed, returning fallback response");
            return new AnalyzeMatchResponse
            {
                MatchScore = 0,
                MissingKeywords = ["Unable to analyze - AI service unavailable"],
                Suggestions = ["Please try again later or check your AI service configuration."]
            };
        }
    }

    public async Task<CareerAdviceResponse> GetCareerAdviceAsync(CareerAdviceRequest request)
    {
        var contextParts = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.CurrentRole))
            contextParts.Add($"Current role: {request.CurrentRole}");
        if (!string.IsNullOrWhiteSpace(request.TargetRole))
            contextParts.Add($"Target role: {request.TargetRole}");
        if (!string.IsNullOrWhiteSpace(request.Experience))
            contextParts.Add($"Experience: {request.Experience}");

        var context = contextParts.Count > 0
            ? $"User context:\n{string.Join("\n", contextParts)}\n\n"
            : string.Empty;

        var prompt = $"""
            You are a career advisor. Provide helpful, actionable career advice.

            {context}User question: {request.Prompt}

            Provide a clear, well-structured response.
            """;

        try
        {
            var responseText = await SendToAIAsync(prompt);
            return new CareerAdviceResponse { Response = responseText };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI career advice failed, returning fallback response");
            return new CareerAdviceResponse
            {
                Response = "I apologize, but the AI service is currently unavailable. Please try again later."
            };
        }
    }

    // ---- AI Provider Abstraction ----

    private async Task<string> SendToAIAsync(string prompt)
    {
        var provider = _config["AI:Provider"]?.ToLowerInvariant() ?? "claude";

        return provider switch
        {
            "gemini" => await SendToGeminiAsync(prompt),
            _ => await SendToClaudeAsync(prompt)
        };
    }

    private async Task<string> SendToClaudeAsync(string prompt)
    {
        var apiKey = _config["AI:Claude:ApiKey"]
            ?? throw new InvalidOperationException("Claude API key is not configured (AI:Claude:ApiKey).");
        var model = _config["AI:Claude:Model"] ?? "claude-sonnet-4-20250514";
        var baseUrl = _config["AI:Claude:BaseUrl"] ?? "https://api.anthropic.com";

        var request = new
        {
            model,
            max_tokens = 2048,
            messages = new[]
            {
                new { role = "user", content = prompt }
            }
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v1/messages");
        httpRequest.Headers.Add("x-api-key", apiKey);
        httpRequest.Headers.Add("anthropic-version", "2023-06-01");
        httpRequest.Content = JsonContent.Create(request, options: JsonOptions);

        var response = await _httpClient.SendAsync(httpRequest);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var text = json.GetProperty("content")[0].GetProperty("text").GetString();

        return text ?? string.Empty;
    }

    private async Task<string> SendToGeminiAsync(string prompt)
    {
        var apiKey = _config["AI:Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini API key is not configured (AI:Gemini:ApiKey).");
        var model = _config["AI:Gemini:Model"] ?? "gemini-2.0-flash";
        var baseUrl = _config["AI:Gemini:BaseUrl"]
            ?? "https://generativelanguage.googleapis.com/v1beta";

        var request = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                maxOutputTokens = 2048,
                temperature = 0.7
            }
        };

        var url = $"{baseUrl}/models/{model}:generateContent?key={apiKey}";

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Content = JsonContent.Create(request, options: JsonOptions);

        var response = await _httpClient.SendAsync(httpRequest);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var text = json
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? string.Empty;
    }

    // ---- Response Parsing ----

    private static AnalyzeMatchResponse ParseAnalyzeMatchResponse(string responseText)
    {
        // Strip markdown code fences if present
        var json = responseText.Trim();
        if (json.StartsWith("```"))
        {
            var firstNewline = json.IndexOf('\n');
            if (firstNewline > 0)
                json = json[(firstNewline + 1)..];
            if (json.EndsWith("```"))
                json = json[..^3];
            json = json.Trim();
        }

        var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var matchScore = root.TryGetProperty("matchScore", out var scoreEl)
            ? scoreEl.GetInt32()
            : 0;

        var missingKeywords = new List<string>();
        if (root.TryGetProperty("missingKeywords", out var kwEl) && kwEl.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in kwEl.EnumerateArray())
            {
                var val = item.GetString();
                if (val is not null) missingKeywords.Add(val);
            }
        }

        var suggestions = new List<string>();
        if (root.TryGetProperty("suggestions", out var sugEl) && sugEl.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in sugEl.EnumerateArray())
            {
                var val = item.GetString();
                if (val is not null) suggestions.Add(val);
            }
        }

        return new AnalyzeMatchResponse
        {
            MatchScore = Math.Clamp(matchScore, 0, 100),
            MissingKeywords = missingKeywords,
            Suggestions = suggestions
        };
    }
}

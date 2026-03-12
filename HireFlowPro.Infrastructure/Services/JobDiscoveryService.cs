using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace HireFlowPro.Infrastructure.Services;

public class JobDiscoveryService : IJobDiscoveryService
{
    private readonly HttpClient _http;
    private readonly ILogger<JobDiscoveryService> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public JobDiscoveryService(HttpClient http, ILogger<JobDiscoveryService> logger)
    {
        _http = http;
        _http.Timeout = TimeSpan.FromSeconds(15);
        _logger = logger;
    }

    public async Task<JobDiscoveryResponse> SearchJobsAsync(string query, string? location = null, int page = 1)
    {
        var allJobs = new List<JobDiscoveryResult>();

        // Fire all API calls in parallel for speed
        var tasks = new List<Task<List<JobDiscoveryResult>>>
        {
            FetchRemotiveAsync(query),
            FetchArbeitnowAsync(query, page),
        };

        var results = await Task.WhenAll(tasks);
        foreach (var batch in results)
            allJobs.AddRange(batch);

        // Filter by location if specified
        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.Trim().ToLowerInvariant();
            allJobs = allJobs
                .Where(j => j.Location.Contains(loc, StringComparison.OrdinalIgnoreCase)
                         || string.Equals(j.Location, "Remote", StringComparison.OrdinalIgnoreCase)
                         || string.Equals(j.Location, "Worldwide", StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        // Sort: newest first, then by relevance (title match)
        var q = query.ToLowerInvariant();
        allJobs = allJobs
            .OrderByDescending(j => j.Title.Contains(q, StringComparison.OrdinalIgnoreCase) ? 1 : 0)
            .ThenByDescending(j => j.PostedAt ?? DateTime.MinValue)
            .ToList();

        // Paginate (20 per page)
        const int pageSize = 20;
        var paged = allJobs.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return new JobDiscoveryResponse
        {
            Jobs = paged,
            Total = allJobs.Count,
            Page = page,
        };
    }

    // ── Remotive (free, no key, remote jobs) ──────────────────────────────────
    private async Task<List<JobDiscoveryResult>> FetchRemotiveAsync(string query)
    {
        try
        {
            var url = $"https://remotive.com/api/remote-jobs?search={Uri.EscapeDataString(query)}&limit=50";
            var resp = await _http.GetFromJsonAsync<RemotiveResponse>(url, JsonOpts);
            if (resp?.Jobs is null) return [];

            return resp.Jobs.Select(j => new JobDiscoveryResult
            {
                Title = j.Title ?? "",
                Company = j.CompanyName ?? "",
                Location = j.CandidateRequiredLocation ?? "Remote",
                Url = j.Url ?? "",
                Source = "Remotive",
                Salary = j.Salary,
                Description = TruncateHtml(j.Description, 300),
                Tags = j.Tags ?? [],
                PostedAt = DateTime.TryParse(j.PublicationDate, out var dt) ? dt : null,
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Remotive API failed");
            return [];
        }
    }

    // ── Arbeitnow (free, no key, EU/global jobs) ─────────────────────────────
    private async Task<List<JobDiscoveryResult>> FetchArbeitnowAsync(string query, int page)
    {
        try
        {
            var url = $"https://www.arbeitnow.com/api/job-board-api?search={Uri.EscapeDataString(query)}&page={page}";
            var resp = await _http.GetFromJsonAsync<ArbeitnowResponse>(url, JsonOpts);
            if (resp?.Data is null) return [];

            return resp.Data.Select(j => new JobDiscoveryResult
            {
                Title = j.Title ?? "",
                Company = j.CompanyName ?? "",
                Location = j.Location ?? "Not specified",
                Url = j.Url ?? "",
                Source = "Arbeitnow",
                Description = TruncateHtml(j.Description, 300),
                Tags = j.Tags ?? [],
                PostedAt = j.CreatedAt > 0
                    ? DateTimeOffset.FromUnixTimeSeconds(j.CreatedAt).UtcDateTime
                    : null,
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Arbeitnow API failed");
            return [];
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static string TruncateHtml(string? html, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(html)) return "";
        // Strip HTML tags
        var text = System.Text.RegularExpressions.Regex.Replace(html, "<[^>]+>", " ");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ").Trim();
        return text.Length > maxLength ? text[..maxLength] + "…" : text;
    }

    // ── API Response Models ──────────────────────────────────────────────────
    private class RemotiveResponse
    {
        public List<RemotiveJob>? Jobs { get; set; }
    }

    private class RemotiveJob
    {
        public string? Title { get; set; }
        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }
        [JsonPropertyName("candidate_required_location")]
        public string? CandidateRequiredLocation { get; set; }
        public string? Url { get; set; }
        public string? Salary { get; set; }
        public string? Description { get; set; }
        public List<string>? Tags { get; set; }
        [JsonPropertyName("publication_date")]
        public string? PublicationDate { get; set; }
    }

    private class ArbeitnowResponse
    {
        public List<ArbeitnowJob>? Data { get; set; }
    }

    private class ArbeitnowJob
    {
        public string? Title { get; set; }
        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }
        public string? Location { get; set; }
        public string? Url { get; set; }
        public string? Description { get; set; }
        public List<string>? Tags { get; set; }
        [JsonPropertyName("created_at")]
        public long CreatedAt { get; set; }
    }
}

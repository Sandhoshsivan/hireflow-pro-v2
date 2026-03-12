using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;
using HireFlowPro.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly IAIQuotaService _quotaService;

    public AIController(IAIService aiService, IAIQuotaService quotaService)
    {
        _aiService = aiService;
        _quotaService = quotaService;
    }

    [HttpGet("quota")]
    public async Task<IActionResult> GetQuota()
    {
        var userId = GetUserId();
        var quota = await _quotaService.CheckQuotaAsync(userId);
        return Ok(quota);
    }

    [HttpPost("analyze-match")]
    public async Task<IActionResult> AnalyzeMatch([FromBody] AnalyzeMatchRequest request)
    {
        var userId = GetUserId();
        var quota = await _quotaService.CheckQuotaAsync(userId);
        if (!quota.Allowed)
            return StatusCode(429, new
            {
                code = "quota_exceeded",
                message = $"Monthly AI limit reached ({quota.Limit}). Upgrade your plan for more.",
                used = quota.Used,
                limit = quota.Limit,
                plan = quota.Plan
            });

        var result = await _aiService.AnalyzeMatchAsync(request);
        await _quotaService.TrackUsageAsync(userId, AIFeature.AnalyzeMatch);
        return Ok(result);
    }

    [HttpPost("career-advice")]
    public async Task<IActionResult> CareerAdvice([FromBody] CareerAdviceRequest request)
    {
        var userId = GetUserId();
        var quota = await _quotaService.CheckQuotaAsync(userId);
        if (!quota.Allowed)
            return StatusCode(429, new
            {
                code = "quota_exceeded",
                message = $"Monthly AI limit reached ({quota.Limit}). Upgrade your plan for more.",
                used = quota.Used,
                limit = quota.Limit,
                plan = quota.Plan
            });

        var result = await _aiService.GetCareerAdviceAsync(request);
        await _quotaService.TrackUsageAsync(userId, AIFeature.CareerAdvice);
        return Ok(result);
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var userId = GetUserId();
        var quota = await _quotaService.CheckQuotaAsync(userId);
        if (!quota.Allowed)
            return StatusCode(429, new
            {
                code = "quota_exceeded",
                message = $"Monthly AI limit reached ({quota.Limit}). Upgrade your plan for more.",
                used = quota.Used,
                limit = quota.Limit,
                plan = quota.Plan
            });

        var adviceRequest = new CareerAdviceRequest { Prompt = request.Message };
        var result = await _aiService.GetCareerAdviceAsync(adviceRequest);
        await _quotaService.TrackUsageAsync(userId, AIFeature.Chat);
        return Ok(new { response = result.Response });
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(claim ?? "0");
    }
}

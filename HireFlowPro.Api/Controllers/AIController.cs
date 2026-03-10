using HireFlowPro.Core.DTOs;
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

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("analyze-match")]
    public async Task<IActionResult> AnalyzeMatch([FromBody] AnalyzeMatchRequest request)
    {
        var result = await _aiService.AnalyzeMatchAsync(request);
        return Ok(result);
    }

    [HttpPost("career-advice")]
    public async Task<IActionResult> CareerAdvice([FromBody] CareerAdviceRequest request)
    {
        var result = await _aiService.GetCareerAdviceAsync(request);
        return Ok(result);
    }
}

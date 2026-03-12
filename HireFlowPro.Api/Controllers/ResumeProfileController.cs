using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/resume-profile")]
[Authorize]
public class ResumeProfileController : ControllerBase
{
    private readonly IResumeProfileService _resumeProfileService;

    public ResumeProfileController(IResumeProfileService resumeProfileService)
    {
        _resumeProfileService = resumeProfileService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        var profile = await _resumeProfileService.GetByUserIdAsync(userId);

        if (profile == null)
            return NotFound(new { code = "PROFILE_NOT_FOUND", message = "Resume profile not found." });

        return Ok(profile);
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveResumeProfileRequest request)
    {
        var userId = GetUserId();
        var profile = await _resumeProfileService.SaveAsync(userId, request);
        return Ok(profile);
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(claim ?? "0");
    }
}

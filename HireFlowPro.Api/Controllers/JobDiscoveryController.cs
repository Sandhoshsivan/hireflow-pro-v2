using HireFlowPro.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize]
public class JobDiscoveryController : ControllerBase
{
    private readonly IJobDiscoveryService _jobDiscoveryService;

    public JobDiscoveryController(IJobDiscoveryService jobDiscoveryService)
    {
        _jobDiscoveryService = jobDiscoveryService;
    }

    [HttpGet("discover")]
    public async Task<IActionResult> Discover(
        [FromQuery] string query,
        [FromQuery] string? location = null,
        [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { message = "Search query is required." });

        var result = await _jobDiscoveryService.SearchJobsAsync(query, location, page);
        return Ok(result);
    }
}

using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] string sort = "date_desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        var request = new ApplicationListRequest
        {
            Status = status,
            Search = search,
            Sort = sort,
            Page = page,
            PageSize = pageSize
        };
        var result = await _applicationService.GetAllAsync(userId, request);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateApplicationRequest request)
    {
        var userId = GetUserId();
        var result = await _applicationService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var result = await _applicationService.GetByIdAsync(userId, id);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateApplicationRequest request)
    {
        var userId = GetUserId();
        var result = await _applicationService.UpdateAsync(userId, id, request);
        return Ok(result);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var userId = GetUserId();
        var result = await _applicationService.UpdateStatusAsync(userId, id, request);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        await _applicationService.DeleteAsync(userId, id);
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = GetUserId();
        var result = await _applicationService.GetStatsAsync(userId);
        return Ok(result);
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv()
    {
        var userId = GetUserId();
        var csv = await _applicationService.ExportCsvAsync(userId);
        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", "applications.csv");
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst("userId")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token."));
    }
}

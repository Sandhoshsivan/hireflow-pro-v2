using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        EnsureAdmin();
        var result = await _adminService.GetStatsAsync();
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> ListUsers(
        [FromQuery] string? search,
        [FromQuery] string? plan,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        EnsureAdmin();
        var request = new UserListRequest
        {
            Search = search,
            Plan = plan,
            Page = page,
            PageSize = pageSize
        };
        var result = await _adminService.ListUsersAsync(request);
        return Ok(result);
    }

    [HttpGet("users/{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        EnsureAdmin();
        var result = await _adminService.GetUserAsync(id);
        return Ok(result);
    }

    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        EnsureAdmin();
        var adminUserId = GetUserId();
        var result = await _adminService.UpdateUserAsync(adminUserId, id, request);
        return Ok(result);
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        EnsureAdmin();
        var adminUserId = GetUserId();
        await _adminService.DeleteUserAsync(adminUserId, id);
        return NoContent();
    }

    [HttpPost("users/{id:int}/set-plan")]
    public async Task<IActionResult> SetPlan(int id, [FromBody] SetPlanRequest request)
    {
        EnsureAdmin();
        var result = await _adminService.SetPlanAsync(id, request);
        return Ok(result);
    }

    [HttpPost("users/{id:int}/toggle-block")]
    public async Task<IActionResult> ToggleBlock(int id)
    {
        EnsureAdmin();
        var adminUserId = GetUserId();
        var result = await _adminService.ToggleBlockAsync(adminUserId, id);
        return Ok(result);
    }

    [HttpPost("users/{id:int}/toggle-admin")]
    public async Task<IActionResult> ToggleAdmin(int id)
    {
        EnsureAdmin();
        var adminUserId = GetUserId();
        var result = await _adminService.ToggleAdminAsync(adminUserId, id);
        return Ok(result);
    }

    [HttpPost("users/{id:int}/impersonate")]
    public async Task<IActionResult> Impersonate(int id)
    {
        EnsureAdmin();
        var result = await _adminService.ImpersonateAsync(id);
        return Ok(result);
    }

    [HttpPost("stop-impersonating")]
    public IActionResult StopImpersonating()
    {
        EnsureAdmin();
        // Client switches back to its own token; nothing to do server-side with stateless JWT.
        return Ok(new { message = "Stopped impersonating." });
    }

    [HttpPost("users/{id:int}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] AdminResetPasswordRequest request)
    {
        EnsureAdmin();
        await _adminService.ResetPasswordAsync(id, request);
        return Ok(new { message = "Password reset successfully." });
    }

    [HttpGet("applications")]
    public async Task<IActionResult> AllApplications(
        [FromQuery] string? search,
        [FromQuery] string? plan,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        EnsureAdmin();
        // Reuse user list endpoint; admin applications listing can be extended later.
        var users = await _adminService.ListUsersAsync(new UserListRequest
        {
            Search = search,
            Plan = plan,
            Page = page,
            PageSize = pageSize
        });
        return Ok(users);
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst("userId")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token."));
    }

    private void EnsureAdmin()
    {
        var isAdmin = User.FindFirst("isAdmin")?.Value;
        if (isAdmin is null || !bool.Parse(isAdmin))
            throw new UnauthorizedAccessException("Admin access required.");
    }
}

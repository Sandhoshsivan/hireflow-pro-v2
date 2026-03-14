using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;
using HireFlowPro.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/billing")]
[Authorize]
public class BillingController : ControllerBase
{
    private readonly AppDbContext _db;

    public BillingController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value ?? "0");

    [HttpGet("plans")]
    public IActionResult GetPlans()
    {
        var userId = GetUserId();
        var user = _db.Users.Find(userId);
        var currentPlan = user?.Plan ?? PlanType.Free;

        var plans = new List<PlanResponse>
        {
            new()
            {
                Name = PlanType.Free,
                Price = PlanType.GetPrice(PlanType.Free),
                Currency = "USD",
                ApplicationLimit = PlanType.GetApplicationLimit(PlanType.Free),
                PrioritySupport = false,
                Features = ["Up to 5 applications", "Basic tracking", "Status pipeline"],
                IsCurrent = currentPlan == PlanType.Free
            },
            new()
            {
                Name = PlanType.Pro,
                Price = PlanType.GetPrice(PlanType.Pro),
                Currency = "USD",
                ApplicationLimit = PlanType.GetApplicationLimit(PlanType.Pro),
                PrioritySupport = false,
                Features = ["Unlimited applications", "AI match analysis", "Contact management", "CSV export", "90 AI uses/month"],
                IsCurrent = currentPlan == PlanType.Pro
            },
            new()
            {
                Name = PlanType.Premium,
                Price = PlanType.GetPrice(PlanType.Premium),
                Currency = "USD",
                ApplicationLimit = PlanType.GetApplicationLimit(PlanType.Premium),
                PrioritySupport = true,
                Features = ["Unlimited applications", "AI match analysis", "AI career advice", "AI resume tailoring", "Unlimited AI uses", "Priority support", "Advanced analytics"],
                IsCurrent = currentPlan == PlanType.Premium
            }
        };

        return Ok(plans);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        // In production this would create a Stripe Checkout session.
        // For now, directly upgrade the user's plan.
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        var planName = (request.Plan ?? "").Trim();
        // Normalize plan name (accept lowercase)
        planName = planName.ToLower() switch
        {
            "pro" => PlanType.Pro,
            "premium" => PlanType.Premium,
            "free" => PlanType.Free,
            _ => planName
        };

        if (planName != PlanType.Free && planName != PlanType.Pro && planName != PlanType.Premium)
            return BadRequest(new { message = $"Invalid plan: {planName}" });

        user.Plan = planName;
        user.PlanStartedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var session = new CheckoutSessionResponse
        {
            SessionId = $"cs_{Guid.NewGuid():N}",
            Url = request.SuccessUrl ?? "/"
        };
        return Ok(session);
    }

    [HttpPost("downgrade")]
    public async Task<IActionResult> Downgrade()
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        user.Plan = PlanType.Free;
        user.PlanStartedAt = null;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Downgraded to Free plan.", plan = PlanType.Free });
    }

    [HttpGet("history")]
    public IActionResult GetHistory()
    {
        var userId = GetUserId();
        var payments = _db.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentHistoryResponse
            {
                Id = p.Id,
                Plan = p.Plan,
                Amount = p.Amount,
                Currency = p.Currency,
                Status = p.Status,
                CreatedAt = p.CreatedAt
            })
            .ToList();

        return Ok(payments);
    }
}

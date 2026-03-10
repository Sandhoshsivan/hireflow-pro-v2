using HireFlowPro.Core.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlowPro.Api.Controllers;

[ApiController]
[Route("api/billing")]
[Authorize]
public class BillingController : ControllerBase
{
    [HttpGet("plans")]
    public IActionResult GetPlans()
    {
        var plans = new List<PlanResponse>
        {
            new()
            {
                Name = "Free",
                Price = 0,
                Currency = "USD",
                ApplicationLimit = 10,
                PrioritySupport = false,
                Features = ["Up to 10 applications", "Basic tracking", "CSV export"]
            },
            new()
            {
                Name = "Pro",
                Price = 9.99m,
                Currency = "USD",
                ApplicationLimit = 100,
                PrioritySupport = false,
                Features = ["Up to 100 applications", "AI match analysis", "Contact management", "Priority tracking", "CSV export"]
            },
            new()
            {
                Name = "Enterprise",
                Price = 29.99m,
                Currency = "USD",
                ApplicationLimit = int.MaxValue,
                PrioritySupport = true,
                Features = ["Unlimited applications", "AI match analysis", "AI career advice", "Contact management", "Priority support", "CSV export", "Advanced analytics"]
            }
        };

        return Ok(plans);
    }

    [HttpPost("checkout")]
    public IActionResult Checkout([FromBody] CheckoutRequest request)
    {
        // Stripe integration placeholder. In production this creates a Stripe Checkout session.
        var session = new CheckoutSessionResponse
        {
            SessionId = $"cs_{Guid.NewGuid():N}",
            Url = request.SuccessUrl ?? "/"
        };
        return Ok(session);
    }

    [HttpPost("downgrade")]
    public IActionResult Downgrade()
    {
        // Placeholder: downgrade user to Free plan.
        return Ok(new { message = "Downgraded to Free plan." });
    }

    [HttpGet("history")]
    public IActionResult GetHistory()
    {
        // Placeholder: return empty payment history until Stripe is integrated.
        return Ok(new List<PaymentHistoryResponse>());
    }
}

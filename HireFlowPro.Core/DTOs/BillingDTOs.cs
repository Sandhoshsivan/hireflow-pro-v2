using System.ComponentModel.DataAnnotations;

namespace HireFlowPro.Core.DTOs;

// ── Requests ──────────────────────────────────────────────

public class CheckoutRequest
{
    [Required, MaxLength(20)]
    public string Plan { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? SuccessUrl { get; set; }

    [MaxLength(500)]
    public string? CancelUrl { get; set; }
}

// ── Responses ─────────────────────────────────────────────

public class PlanResponse
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int ApplicationLimit { get; set; }
    public bool PrioritySupport { get; set; }
    public List<string> Features { get; set; } = [];
    public bool IsCurrent { get; set; }
}

public class PaymentHistoryResponse
{
    public int Id { get; set; }
    public string Plan { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CheckoutSessionResponse
{
    public string SessionId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

using HireFlowPro.Core.Entities;
using HireFlowPro.Core.Interfaces;
using HireFlowPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HireFlowPro.Infrastructure.Services;

public class AIQuotaService : IAIQuotaService
{
    private readonly AppDbContext _db;

    public AIQuotaService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AIQuotaStatus> CheckQuotaAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return new AIQuotaStatus { Allowed = false, Limit = 0, Used = 0, Remaining = 0, Plan = "Unknown" };

        var limit = AIQuotaLimits.GetMonthlyLimit(user.Plan);

        // Unlimited plan
        if (limit == -1)
            return new AIQuotaStatus { Allowed = true, Limit = -1, Used = 0, Remaining = -1, Plan = user.Plan };

        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var used = await _db.AIUsages
            .CountAsync(u => u.UserId == userId && u.CreatedAt >= startOfMonth);

        var remaining = Math.Max(0, limit - used);

        return new AIQuotaStatus
        {
            Allowed = used < limit,
            Used = used,
            Limit = limit,
            Remaining = remaining,
            Plan = user.Plan
        };
    }

    public async Task TrackUsageAsync(int userId, string feature)
    {
        _db.AIUsages.Add(new AIUsage
        {
            UserId = userId,
            Feature = feature,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}

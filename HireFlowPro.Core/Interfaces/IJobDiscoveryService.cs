using HireFlowPro.Core.DTOs;

namespace HireFlowPro.Core.Interfaces;

public interface IJobDiscoveryService
{
    Task<JobDiscoveryResponse> SearchJobsAsync(string query, string? location = null, int page = 1);
}

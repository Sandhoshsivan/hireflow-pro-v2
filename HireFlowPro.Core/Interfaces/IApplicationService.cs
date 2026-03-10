using HireFlowPro.Core.DTOs;

namespace HireFlowPro.Core.Interfaces;

public interface IApplicationService
{
    Task<ApplicationListResponse> GetAllAsync(int userId, ApplicationListRequest request);
    Task<ApplicationDetailDto> GetByIdAsync(int userId, int applicationId);
    Task<ApplicationDetailDto> CreateAsync(int userId, CreateApplicationRequest request);
    Task<ApplicationDetailDto> UpdateAsync(int userId, int applicationId, UpdateApplicationRequest request);
    Task<ApplicationDetailDto> UpdateStatusAsync(int userId, int applicationId, UpdateStatusRequest request);
    Task DeleteAsync(int userId, int applicationId);
    Task<ApplicationStatsDto> GetStatsAsync(int userId);
    Task<string> ExportCsvAsync(int userId);
}

using HireFlowPro.Core.DTOs;

namespace HireFlowPro.Core.Interfaces;

public interface IResumeProfileService
{
    Task<ResumeProfileDto?> GetByUserIdAsync(int userId);
    Task<ResumeProfileDto> SaveAsync(int userId, SaveResumeProfileRequest request);
}

using HireFlowPro.Core.DTOs;

namespace HireFlowPro.Core.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<UserListResponse> ListUsersAsync(UserListRequest request);
    Task<UserDetailDto> GetUserAsync(int userId);
    Task<UserDetailDto> UpdateUserAsync(int adminUserId, int userId, UpdateUserRequest request);
    Task DeleteUserAsync(int adminUserId, int userId);
    Task<UserDetailDto> SetPlanAsync(int userId, SetPlanRequest request);
    Task<UserDetailDto> ToggleBlockAsync(int adminUserId, int userId);
    Task<UserDetailDto> ToggleAdminAsync(int adminUserId, int userId);
    Task<ImpersonateResponse> ImpersonateAsync(int userId);
    Task ResetPasswordAsync(int userId, AdminResetPasswordRequest request);
}

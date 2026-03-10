using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;

namespace HireFlowPro.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string baseUrl);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<UserProfileDto> GetProfileAsync(int userId);
    string GenerateJwtToken(User user, bool impersonating = false);
}

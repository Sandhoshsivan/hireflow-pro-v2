using HireFlowPro.Core.DTOs;

namespace HireFlowPro.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string baseUrl);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<UserProfileDto> GetProfileAsync(int userId);
}

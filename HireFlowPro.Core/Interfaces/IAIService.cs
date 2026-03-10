using HireFlowPro.Core.DTOs;

namespace HireFlowPro.Core.Interfaces;

public interface IAIService
{
    Task<AnalyzeMatchResponse> AnalyzeMatchAsync(AnalyzeMatchRequest request);
    Task<CareerAdviceResponse> GetCareerAdviceAsync(CareerAdviceRequest request);
}

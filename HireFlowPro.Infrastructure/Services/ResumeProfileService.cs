using HireFlowPro.Core.DTOs;
using HireFlowPro.Core.Entities;
using HireFlowPro.Core.Interfaces;
using HireFlowPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HireFlowPro.Infrastructure.Services;

public class ResumeProfileService : IResumeProfileService
{
    private readonly AppDbContext _db;

    public ResumeProfileService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ResumeProfileDto?> GetByUserIdAsync(int userId)
    {
        var profile = await _db.ResumeProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(rp => rp.UserId == userId);

        return profile == null ? null : MapToDto(profile);
    }

    public async Task<ResumeProfileDto> SaveAsync(int userId, SaveResumeProfileRequest request)
    {
        var profile = await _db.ResumeProfiles
            .FirstOrDefaultAsync(rp => rp.UserId == userId);

        if (profile == null)
        {
            profile = new ResumeProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _db.ResumeProfiles.Add(profile);
        }

        profile.FullName = request.FullName;
        profile.Title = request.Title;
        profile.Summary = request.Summary;
        profile.Skills = request.Skills;
        profile.Experience = request.Experience;
        profile.Education = request.Education;
        profile.Certifications = request.Certifications;
        profile.Languages = request.Languages;
        profile.Phone = request.Phone;
        profile.Email = request.Email;
        profile.Location = request.Location;
        profile.LinkedIn = request.LinkedIn;
        profile.Portfolio = request.Portfolio;
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(profile);
    }

    private static ResumeProfileDto MapToDto(ResumeProfile profile)
    {
        return new ResumeProfileDto
        {
            Id = profile.Id,
            FullName = profile.FullName,
            Title = profile.Title,
            Summary = profile.Summary,
            Skills = profile.Skills,
            Experience = profile.Experience,
            Education = profile.Education,
            Certifications = profile.Certifications,
            Languages = profile.Languages,
            Phone = profile.Phone,
            Email = profile.Email,
            Location = profile.Location,
            LinkedIn = profile.LinkedIn,
            Portfolio = profile.Portfolio,
            CreatedAt = profile.CreatedAt,
            UpdatedAt = profile.UpdatedAt
        };
    }
}

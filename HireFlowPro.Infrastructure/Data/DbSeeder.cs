using System.Security.Cryptography;
using System.Text;
using HireFlowPro.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace HireFlowPro.Infrastructure.Data;

/// <summary>
/// Seeds two demo accounts on first run:
///   Super Admin  — admin@hireflowpro.com  / Admin@123!
///   Demo User    — demo@hireflowpro.com   / Demo@123!  (prefilled with sample applications)
/// </summary>
public static class DbSeeder
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;
    private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;

    public static async Task SeedAsync(AppDbContext db)
    {
        // Only seed if the DB has no users yet
        if (await db.Users.AnyAsync()) return;

        var now = DateTime.UtcNow;

        // ── 1. Super Admin ────────────────────────────────────────────────────
        var admin = new User
        {
            Name = "Super Admin",
            Email = "admin@hireflowpro.com",
            PasswordHash = HashPassword("Admin@123!"),
            RoleTitle = "Admin",
            Plan = PlanType.Premium,
            IsAdmin = true,
            CreatedAt = now.AddDays(-60),
        };
        db.Users.Add(admin);

        // ── 2. Demo User ──────────────────────────────────────────────────────
        var demo = new User
        {
            Name = "Alex Johnson",
            Email = "demo@hireflowpro.com",
            PasswordHash = HashPassword("Demo@123!"),
            RoleTitle = "User",
            Plan = PlanType.Pro,
            IsAdmin = false,
            CreatedAt = now.AddDays(-45),
        };
        db.Users.Add(demo);

        await db.SaveChangesAsync();

        // ── 3. Sample applications for the demo user ──────────────────────────
        var apps = new List<Application>
        {
            new() {
                UserId = demo.Id, JobTitle = "Senior Full Stack Engineer", Company = "Stripe",
                Location = "San Francisco, CA", SalaryRange = "$160k–$200k",
                Status = ApplicationStatus.Interview, Priority = ApplicationPriority.High,
                AppliedDate = now.AddDays(-28), InterviewDate = now.AddDays(3),
                FollowUpDate = now.AddDays(3),
                Notes = "Final round — system design + behavioural. Prep distributed systems.",
                JobUrl = "https://stripe.com/jobs",
                MatchScore = 87,
                CreatedAt = now.AddDays(-28), UpdatedAt = now.AddDays(-5),
                LastActivityDate = now.AddDays(-5),
            },
            new() {
                UserId = demo.Id, JobTitle = "Staff Software Engineer", Company = "Notion",
                Location = "Remote", SalaryRange = "$180k–$230k",
                Status = ApplicationStatus.Interview, Priority = ApplicationPriority.High,
                AppliedDate = now.AddDays(-20), InterviewDate = now.AddDays(7),
                Notes = "Technical phone screen passed. On-site scheduled.",
                JobUrl = "https://notion.so/jobs",
                MatchScore = 82,
                CreatedAt = now.AddDays(-20), UpdatedAt = now.AddDays(-3),
                LastActivityDate = now.AddDays(-3),
            },
            new() {
                UserId = demo.Id, JobTitle = "Engineering Manager", Company = "Linear",
                Location = "Remote", SalaryRange = "$200k–$250k",
                Status = ApplicationStatus.Applied, Priority = ApplicationPriority.High,
                AppliedDate = now.AddDays(-10), FollowUpDate = now.AddDays(4),
                Notes = "Referral from ex-colleague. Strong culture fit.",
                JobUrl = "https://linear.app/jobs",
                MatchScore = 79,
                CreatedAt = now.AddDays(-10), UpdatedAt = now.AddDays(-10),
                LastActivityDate = now.AddDays(-10),
            },
            new() {
                UserId = demo.Id, JobTitle = "Principal Engineer", Company = "Figma",
                Location = "San Francisco, CA", SalaryRange = "$220k–$280k",
                Status = ApplicationStatus.Applied, Priority = ApplicationPriority.Medium,
                AppliedDate = now.AddDays(-14), FollowUpDate = now.AddDays(0),
                Notes = "Applied via company portal. Tailored cover letter submitted.",
                JobUrl = "https://figma.com/jobs",
                MatchScore = 74,
                CreatedAt = now.AddDays(-14), UpdatedAt = now.AddDays(-14),
                LastActivityDate = now.AddDays(-14),
            },
            new() {
                UserId = demo.Id, JobTitle = "Backend Engineer III", Company = "Vercel",
                Location = "Remote", SalaryRange = "$150k–$190k",
                Status = ApplicationStatus.Offer, Priority = ApplicationPriority.High,
                AppliedDate = now.AddDays(-35),
                Notes = "Offer received! $175k base + equity. Deciding by Friday.",
                JobUrl = "https://vercel.com/careers",
                MatchScore = 91,
                CreatedAt = now.AddDays(-35), UpdatedAt = now.AddDays(-2),
                LastActivityDate = now.AddDays(-2),
            },
            new() {
                UserId = demo.Id, JobTitle = "Senior React Developer", Company = "Shopify",
                Location = "Remote", SalaryRange = "$140k–$175k",
                Status = ApplicationStatus.Rejected, Priority = ApplicationPriority.Medium,
                AppliedDate = now.AddDays(-42),
                Notes = "Rejected after final round. Feedback: looking for more commerce domain experience.",
                JobUrl = "https://shopify.com/careers",
                MatchScore = 68,
                CreatedAt = now.AddDays(-42), UpdatedAt = now.AddDays(-12),
                LastActivityDate = now.AddDays(-12),
            },
            new() {
                UserId = demo.Id, JobTitle = "Tech Lead", Company = "Retool",
                Location = "San Francisco, CA", SalaryRange = "$170k–$210k",
                Status = ApplicationStatus.Ghosted, Priority = ApplicationPriority.Low,
                AppliedDate = now.AddDays(-38),
                Notes = "Sent follow-up twice. No response.",
                JobUrl = "https://retool.com/careers",
                MatchScore = 65,
                CreatedAt = now.AddDays(-38), UpdatedAt = now.AddDays(-25),
                LastActivityDate = now.AddDays(-25),
            },
            new() {
                UserId = demo.Id, JobTitle = "Senior Software Engineer", Company = "Discord",
                Location = "San Francisco, CA", SalaryRange = "$155k–$195k",
                Status = ApplicationStatus.Applied, Priority = ApplicationPriority.Medium,
                AppliedDate = now.AddDays(-5), FollowUpDate = now.AddDays(9),
                Notes = "Referral from LinkedIn connection. Infrastructure team role.",
                JobUrl = "https://discord.com/jobs",
                MatchScore = 76,
                CreatedAt = now.AddDays(-5), UpdatedAt = now.AddDays(-5),
                LastActivityDate = now.AddDays(-5),
            },
            new() {
                UserId = demo.Id, JobTitle = "Platform Engineer", Company = "Datadog",
                Location = "New York, NY", SalaryRange = "$160k–$200k",
                Status = ApplicationStatus.Saved, Priority = ApplicationPriority.Medium,
                Notes = "Bookmarked — looks promising. Need to tailor resume.",
                JobUrl = "https://datadog.com/jobs",
                CreatedAt = now.AddDays(-3), UpdatedAt = now.AddDays(-3),
                LastActivityDate = now.AddDays(-3),
            },
            new() {
                UserId = demo.Id, JobTitle = "Senior Backend Engineer", Company = "Anthropic",
                Location = "San Francisco, CA", SalaryRange = "$200k–$260k",
                Status = ApplicationStatus.Saved, Priority = ApplicationPriority.High,
                Notes = "Dream company. Need strong ML background section in resume.",
                JobUrl = "https://anthropic.com/careers",
                CreatedAt = now.AddDays(-1), UpdatedAt = now.AddDays(-1),
                LastActivityDate = now.AddDays(-1),
            },
            new() {
                UserId = demo.Id, JobTitle = "Frontend Engineer", Company = "Linear",
                Location = "Remote", SalaryRange = "$130k–$170k",
                Status = ApplicationStatus.Rejected, Priority = ApplicationPriority.Low,
                AppliedDate = now.AddDays(-30),
                Notes = "Moved forward with a candidate with more design systems experience.",
                CreatedAt = now.AddDays(-30), UpdatedAt = now.AddDays(-8),
                LastActivityDate = now.AddDays(-8),
            },
            new() {
                UserId = demo.Id, JobTitle = "Staff Engineer", Company = "Loom",
                Location = "Remote", SalaryRange = "$175k–$215k",
                Status = ApplicationStatus.Ghosted, Priority = ApplicationPriority.Low,
                AppliedDate = now.AddDays(-44),
                Notes = "Applied cold. Followed up after 2 weeks, no reply.",
                CreatedAt = now.AddDays(-44), UpdatedAt = now.AddDays(-28),
                LastActivityDate = now.AddDays(-28),
            },
        };

        db.Applications.AddRange(apps);
        await db.SaveChangesAsync();

        // ── 4. Timeline events for a few apps ────────────────────────────────
        var stripeApp = apps[0];
        var vercelApp = apps[4];

        db.Timelines.AddRange(
            new Timeline { ApplicationId = stripeApp.Id, FromStatus = ApplicationStatus.Saved, ToStatus = ApplicationStatus.Applied, Note = "Submitted via Stripe careers portal.", CreatedAt = now.AddDays(-28) },
            new Timeline { ApplicationId = stripeApp.Id, FromStatus = ApplicationStatus.Applied, ToStatus = ApplicationStatus.Interview, Note = "30-min recruiter call with Sarah M. Positive outcome.", CreatedAt = now.AddDays(-21) },
            new Timeline { ApplicationId = stripeApp.Id, FromStatus = ApplicationStatus.Interview, ToStatus = ApplicationStatus.Interview, Note = "Technical round: LeetCode graphs + DP. Passed.", CreatedAt = now.AddDays(-14) },
            new Timeline { ApplicationId = stripeApp.Id, FromStatus = ApplicationStatus.Interview, ToStatus = ApplicationStatus.Interview, Note = "System design: payment pipeline. Strong feedback from panel.", CreatedAt = now.AddDays(-7) },

            new Timeline { ApplicationId = vercelApp.Id, FromStatus = ApplicationStatus.Saved, ToStatus = ApplicationStatus.Applied, Note = "Applied via referral from LinkedIn connection.", CreatedAt = now.AddDays(-35) },
            new Timeline { ApplicationId = vercelApp.Id, FromStatus = ApplicationStatus.Applied, ToStatus = ApplicationStatus.Interview, Note = "Intro call with EM Tom B. — very positive.", CreatedAt = now.AddDays(-28) },
            new Timeline { ApplicationId = vercelApp.Id, FromStatus = ApplicationStatus.Interview, ToStatus = ApplicationStatus.Interview, Note = "Pair programming in TypeScript. Great feedback.", CreatedAt = now.AddDays(-20) },
            new Timeline { ApplicationId = vercelApp.Id, FromStatus = ApplicationStatus.Interview, ToStatus = ApplicationStatus.Offer, Note = "Offer: $175k base + $40k equity (4yr vest), 20 PTO days.", CreatedAt = now.AddDays(-2) }
        );

        // ── 5. Contacts for demo apps ─────────────────────────────────────────
        db.Contacts.AddRange(
            new Contact { ApplicationId = stripeApp.Id, Name = "Sarah Mitchell", Title = "Technical Recruiter", Email = "sarah.m@stripe.com", LinkedInUrl = "https://linkedin.com/in/sarahmitchell", Notes = "Very responsive. Prefers email.", CreatedAt = now.AddDays(-28) },
            new Contact { ApplicationId = stripeApp.Id, Name = "David Park", Title = "Engineering Manager", Email = "d.park@stripe.com", Notes = "Hiring manager. Strong interest in systems design.", CreatedAt = now.AddDays(-21) },
            new Contact { ApplicationId = vercelApp.Id, Name = "Tom Briggs", Title = "Engineering Manager", Email = "tom@vercel.com", LinkedInUrl = "https://linkedin.com/in/tombriggs", CreatedAt = now.AddDays(-35) }
        );

        await db.SaveChangesAsync();
    }

    // ── Same PBKDF2-SHA256 algorithm used by AuthService ─────────────────────
    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            Iterations,
            HashAlgorithm,
            HashSize
        );
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
}

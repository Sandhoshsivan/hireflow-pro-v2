using HireFlowPro.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace HireFlowPro.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Timeline> Timelines => Set<Timeline>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PasswordReset> PasswordResets => Set<PasswordReset>();
    public DbSet<AIUsage> AIUsages => Set<AIUsage>();
    public DbSet<ResumeProfile> ResumeProfiles => Set<ResumeProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ----- User -----
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Plan).HasDefaultValue(PlanType.Free);
            entity.Property(u => u.IsAdmin).HasDefaultValue(false);
            entity.Property(u => u.IsBlocked).HasDefaultValue(false);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasMany(u => u.Applications)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(u => u.Payments)
                .WithOne(p => p.User)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(u => u.PasswordResets)
                .WithOne(pr => pr.User)
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(u => u.AIUsages)
                .WithOne(au => au.User)
                .HasForeignKey(au => au.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(u => u.ResumeProfile)
                .WithOne(rp => rp.User)
                .HasForeignKey<ResumeProfile>(rp => rp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Application -----
        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasIndex(a => a.UserId);
            entity.HasIndex(a => a.Status);
            entity.HasIndex(a => new { a.UserId, a.Status });
            entity.HasIndex(a => a.LastActivityDate);
            entity.Property(a => a.Status).HasDefaultValue(ApplicationStatus.Saved);
            entity.Property(a => a.Priority).HasDefaultValue(ApplicationPriority.Medium);
            entity.Property(a => a.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(a => a.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(a => a.LastActivityDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasMany(a => a.Timelines)
                .WithOne(t => t.Application)
                .HasForeignKey(t => t.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(a => a.Contacts)
                .WithOne(c => c.Application)
                .HasForeignKey(c => c.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Timeline -----
        modelBuilder.Entity<Timeline>(entity =>
        {
            entity.HasIndex(t => t.ApplicationId);
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ----- Contact -----
        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasIndex(c => c.ApplicationId);
            entity.Property(c => c.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ----- Payment -----
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(p => p.UserId);
            entity.HasIndex(p => p.StripePaymentIntentId).IsUnique();
            entity.Property(p => p.Status).HasDefaultValue(PaymentStatus.Pending);
            entity.Property(p => p.Currency).HasDefaultValue("USD");
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ----- AIUsage -----
        modelBuilder.Entity<AIUsage>(entity =>
        {
            entity.HasIndex(au => new { au.UserId, au.CreatedAt });
            entity.HasIndex(au => new { au.UserId, au.Feature });
            entity.Property(au => au.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ----- ResumeProfile -----
        modelBuilder.Entity<ResumeProfile>(entity =>
        {
            entity.HasIndex(rp => rp.UserId).IsUnique();
            entity.Property(rp => rp.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(rp => rp.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ----- PasswordReset -----
        modelBuilder.Entity<PasswordReset>(entity =>
        {
            entity.HasIndex(pr => pr.Token).IsUnique();
            entity.HasIndex(pr => pr.UserId);
            entity.Property(pr => pr.IsUsed).HasDefaultValue(false);
            entity.Property(pr => pr.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}

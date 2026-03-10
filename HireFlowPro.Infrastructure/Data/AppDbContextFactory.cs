using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HireFlowPro.Infrastructure.Data;

/// <summary>
/// Design-time factory used by EF Core migrations (dotnet ef migrations add).
/// Falls back to SQLite in local dev so no PostgreSQL connection is needed.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlite("Data Source=hireflowpro_migrations.db");
        return new AppDbContext(optionsBuilder.Options);
    }
}

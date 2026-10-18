namespace CommerceSaaS.Infrastructure.Data;

public static class DbInitializer
{
    /// <summary>
    /// Database starts clean. Tenants, master categories, UOMs, and products
    /// are created through the Tenant Signup flow and the Tenant Admin UI.
    /// </summary>
    public static Task SeedAsync(ApplicationDbContext context)
    {
        // Clean start — no hardcoded seed data.
        return Task.CompletedTask;
    }
}

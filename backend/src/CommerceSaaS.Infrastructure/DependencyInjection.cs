using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Infrastructure.Data;
using CommerceSaaS.Infrastructure.Repositories;
using CommerceSaaS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CommerceSaaS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ─── PostgreSQL Database Context ────────────────────────────
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        // ─── HTTP Client for Resend Email API ───────────────────────
        services.AddHttpClient<IEmailService, ResendEmailService>();

        // ─── Repositories ───────────────────────────────────────────
        services.AddSingleton<IProductRepository, InMemoryProductRepository>();
        services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();

        return services;
    }
}

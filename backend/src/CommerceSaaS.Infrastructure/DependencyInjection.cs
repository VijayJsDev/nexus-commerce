using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Infrastructure.Repositories;
using CommerceSaaS.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CommerceSaaS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // HTTP Client for Resend Email API
        services.AddHttpClient<IEmailService, ResendEmailService>();

        // Repositories
        services.AddSingleton<IProductRepository, InMemoryProductRepository>();
        services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();

        return services;
    }
}

using CommerceSaaS.Application.DTOs;

namespace CommerceSaaS.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendOrderNotificationEmailAsync(OrderDto order, string superAdminEmail);
}

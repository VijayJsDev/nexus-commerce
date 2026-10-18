namespace CommerceSaaS.Application.DTOs;

public class RegisterTenantDto
{
    public string StoreName { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty; // Store slug (e.g. "faesthatic-corner")
    public string AdminEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginTenantDto
{
    public string TenantId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class TenantAuthResponseDto
{
    public string TenantId { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

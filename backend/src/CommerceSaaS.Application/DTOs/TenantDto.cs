namespace CommerceSaaS.Application.DTOs;

public class TenantDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? SupportPhone { get; set; }
    public string? Gstin { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateTenantDto
{
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? SupportPhone { get; set; }
    public string? Gstin { get; set; }
    public string? Address { get; set; }
}

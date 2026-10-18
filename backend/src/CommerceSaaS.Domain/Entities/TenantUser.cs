namespace CommerceSaaS.Domain.Entities;

public class TenantUser
{
    public int Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "TenantAdmin";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Tenant? Tenant { get; set; }
}

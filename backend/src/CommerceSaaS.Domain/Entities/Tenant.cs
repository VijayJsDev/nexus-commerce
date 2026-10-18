namespace CommerceSaaS.Domain.Entities;

public class Tenant
{
    public string Id { get; set; } = string.Empty; // e.g. "faesthatic-corner"
    public string Name { get; set; } = string.Empty; // e.g. "Faesthatic Corner"
    public string? LogoUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? SupportPhone { get; set; }
    public string? Gstin { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Category> Categories { get; set; } = [];
    public ICollection<UnitOfMeasurement> UnitsOfMeasurement { get; set; } = [];
    public ICollection<TenantUser> Users { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
}

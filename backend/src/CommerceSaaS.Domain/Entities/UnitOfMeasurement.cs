namespace CommerceSaaS.Domain.Entities;

public class UnitOfMeasurement
{
    public int Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // e.g. "PCS", "PACK", "SET", "BOX", "KG", "GM", "MTR"
    public string Name { get; set; } = string.Empty; // e.g. "Pieces", "Pack of 5"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Tenant? Tenant { get; set; }
    public ICollection<Product> Products { get; set; } = [];
}

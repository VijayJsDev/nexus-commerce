namespace CommerceSaaS.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string TenantId { get; set; } = "faesthatic-corner";
    public int? CategoryId { get; set; }
    public int? UomId { get; set; }

    // Core product fields
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitRate { get; set; }
    
    // Alias for backwards compatibility with existing controllers/DTOs
    public decimal Price
    {
        get => UnitRate;
        set => UnitRate = value;
    }

    // Category display name (backward compatible with controllers & seed)
    public string? Category { get; set; }

    // Unit of measurement display string (e.g. "PCS", "PACK")
    public string? Uom { get; set; } = "PCS";

    // Effective Date & Discount
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow.Date;
    public decimal? MaxDiscount { get; set; } = 0.00m;

    // GST Breakdown (CGST, SGST, IGST)
    public decimal CgstRate { get; set; } = 9.00m;
    public decimal SgstRate { get; set; } = 9.00m;
    public decimal IgstRate { get; set; } = 18.00m;
    public string HsnCode { get; set; } = "3926";

    // Media & Details
    public string? Description { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int StockQuantity { get; set; } = 100;
    public bool IsActive { get; set; } = true;

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties for EF Core relationships
    public Tenant? Tenant { get; set; }
    public Category? CategoryNav { get; set; }
    public UnitOfMeasurement? UnitOfMeasurement { get; set; }
    public ICollection<ProductImage> GalleryImages { get; set; } = [];
}

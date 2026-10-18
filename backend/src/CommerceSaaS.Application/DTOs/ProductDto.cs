namespace CommerceSaaS.Application.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string TenantId { get; set; } = "faesthatic-corner";
    public int? CategoryId { get; set; }
    public int? UomId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitRate { get; set; }
    public decimal Price { get => UnitRate; set => UnitRate = value; }

    public DateTime EffectiveFrom { get; set; }
    public decimal? MaxDiscount { get; set; }

    public decimal CgstRate { get; set; }
    public decimal SgstRate { get; set; }
    public decimal IgstRate { get; set; }
    public string HsnCode { get; set; } = "3926";

    public string? Description { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Uom { get; set; }

    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
}

public class CreateProductDto
{
    public string TenantId { get; set; } = "faesthatic-corner";
    public int? CategoryId { get; set; }
    public int? UomId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitRate { get; set; }
    public decimal Price { get => UnitRate; set => UnitRate = value; }

    public DateTime? EffectiveFrom { get; set; }
    public decimal? MaxDiscount { get; set; } = 0.00m;

    public decimal? CgstRate { get; set; } = 9.00m;
    public decimal? SgstRate { get; set; } = 9.00m;
    public decimal? IgstRate { get; set; } = 18.00m;
    public string? HsnCode { get; set; } = "3926";

    public string? Description { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Uom { get; set; } = "PCS";

    public int StockQuantity { get; set; } = 100;
}

public class UpdateProductDto
{
    public int? CategoryId { get; set; }
    public int? UomId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitRate { get; set; }
    public decimal Price { get => UnitRate; set => UnitRate = value; }

    public DateTime? EffectiveFrom { get; set; }
    public decimal? MaxDiscount { get; set; }

    public decimal CgstRate { get; set; }
    public decimal SgstRate { get; set; }
    public decimal IgstRate { get; set; }
    public string HsnCode { get; set; } = "3926";

    public string? Description { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Uom { get; set; }

    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}

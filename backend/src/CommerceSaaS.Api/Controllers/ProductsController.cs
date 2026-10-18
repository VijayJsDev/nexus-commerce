using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Domain.Entities;
using CommerceSaaS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        ApplicationDbContext context,
        ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all active products for the tenant catalog.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts([FromQuery] string tenantId = "faesthatic-corner")
    {
        var normalizedTenantId = tenantId.Trim().ToLowerInvariant();
        _logger.LogInformation("--> [ProductsController] GetAllProducts called for Tenant: '{TenantId}'", normalizedTenantId);

        var dbProducts = await _context.Products
            .Where(p => p.TenantId == normalizedTenantId && p.IsActive)
            .OrderBy(p => p.Id)
            .Select(p => MapToDto(p))
            .ToListAsync();

        _logger.LogInformation("--> [ProductsController] Found {Count} active products in DB for Tenant: '{TenantId}'", dbProducts.Count, normalizedTenantId);

        return Ok(dbProducts);
    }

    /// <summary>
    /// Gets a single product by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProductById(int id)
    {
        var dbProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (dbProduct == null)
        {
            return NotFound(new { message = $"Product with ID {id} was not found." });
        }

        return Ok(MapToDto(dbProduct));
    }

    /// <summary>
    /// Creates a new product with all 11 fields including GST breakdown, SKU, and UOM.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Product name is required." });
        }

        var normalizedTenantId = (dto.TenantId ?? "faesthatic-corner").Trim().ToLowerInvariant();
        var sku = !string.IsNullOrWhiteSpace(dto.Sku)
            ? dto.Sku.Trim().ToUpperInvariant()
            : $"SKU-{DateTime.UtcNow.Ticks % 1000000:D6}";

        var product = new Product
        {
            TenantId = normalizedTenantId,
            Name = dto.Name.Trim(),
            Sku = sku,
            UnitRate = dto.UnitRate > 0 ? dto.UnitRate : dto.Price,
            EffectiveFrom = dto.EffectiveFrom ?? DateTime.UtcNow.Date,
            MaxDiscount = dto.MaxDiscount ?? 0.00m,
            CgstRate = dto.CgstRate ?? 9.00m,
            SgstRate = dto.SgstRate ?? 9.00m,
            IgstRate = dto.IgstRate ?? 18.00m,
            HsnCode = !string.IsNullOrWhiteSpace(dto.HsnCode) ? dto.HsnCode : "3926",
            Category = dto.Category,
            CategoryId = dto.CategoryId,
            Uom = dto.Uom ?? "PCS",
            UomId = dto.UomId,
            Description = dto.Description,
            ImageUrl = !string.IsNullOrWhiteSpace(dto.ImageUrl) ? dto.ImageUrl : "/product_image_1.jpg",
            StockQuantity = dto.StockQuantity > 0 ? dto.StockQuantity : 100,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, MapToDto(product));
    }

    /// <summary>
    /// Updates an existing product.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Product name is required." });
        }

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} was not found." });
        }

        product.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Sku)) product.Sku = dto.Sku.Trim().ToUpperInvariant();
        product.UnitRate = dto.UnitRate > 0 ? dto.UnitRate : dto.Price;
        if (dto.EffectiveFrom.HasValue) product.EffectiveFrom = dto.EffectiveFrom.Value;
        product.MaxDiscount = dto.MaxDiscount ?? product.MaxDiscount;
        product.CgstRate = dto.CgstRate;
        product.SgstRate = dto.SgstRate;
        product.IgstRate = dto.IgstRate;
        if (!string.IsNullOrWhiteSpace(dto.HsnCode)) product.HsnCode = dto.HsnCode;
        product.Category = dto.Category;
        product.CategoryId = dto.CategoryId;
        product.Uom = dto.Uom;
        product.UomId = dto.UomId;
        product.Description = dto.Description;
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) product.ImageUrl = dto.ImageUrl;
        product.StockQuantity = dto.StockQuantity;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(MapToDto(product));
    }

    /// <summary>
    /// Deletes or deactivates a product.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} was not found." });
        }

        product.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        TenantId = p.TenantId,
        CategoryId = p.CategoryId,
        UomId = p.UomId,
        Name = p.Name,
        Sku = p.Sku,
        UnitRate = p.UnitRate,
        EffectiveFrom = p.EffectiveFrom,
        MaxDiscount = p.MaxDiscount,
        CgstRate = p.CgstRate,
        SgstRate = p.SgstRate,
        IgstRate = p.IgstRate,
        HsnCode = p.HsnCode,
        Category = p.Category,
        Uom = p.Uom,
        Description = p.Description,
        ImageUrl = p.ImageUrl,
        StockQuantity = p.StockQuantity,
        IsActive = p.IsActive
    };
}

using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Domain.Entities;
using CommerceSaaS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext? _context;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(IServiceProvider serviceProvider, ILogger<CategoriesController> logger)
    {
        _context = serviceProvider.GetService<ApplicationDbContext>();
        _logger = logger;
    }

    /// <summary>
    /// Gets all categories for the specified tenant.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories([FromQuery] string tenantId = "faesthatic-corner")
    {
        var normalizedTenantId = tenantId.Trim().ToLowerInvariant();

        if (_context != null)
        {
            var categories = await _context.Categories
                .Where(c => c.TenantId == normalizedTenantId && c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    TenantId = c.TenantId,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive,
                    ProductCount = c.Products.Count(p => p.IsActive)
                })
                .ToListAsync();

            return Ok(categories);
        }

        // In-memory fallback
        var fallbackCategories = new List<CategoryDto>
        {
            new() { Id = 1, TenantId = normalizedTenantId, Name = "Resin Decor", Slug = "resin-decor", DisplayOrder = 1, IsActive = true, ProductCount = 3 },
            new() { Id = 2, TenantId = normalizedTenantId, Name = "Floral Cards", Slug = "floral-cards", DisplayOrder = 2, IsActive = true, ProductCount = 2 },
            new() { Id = 3, TenantId = normalizedTenantId, Name = "Floral Tape", Slug = "floral-tape", DisplayOrder = 3, IsActive = true, ProductCount = 1 },
            new() { Id = 4, TenantId = normalizedTenantId, Name = "Gift Sets", Slug = "gift-sets", DisplayOrder = 4, IsActive = true, ProductCount = 1 },
            new() { Id = 5, TenantId = normalizedTenantId, Name = "Wall Clocks", Slug = "wall-clocks", DisplayOrder = 5, IsActive = true, ProductCount = 1 },
            new() { Id = 6, TenantId = normalizedTenantId, Name = "Trinkets", Slug = "trinkets", DisplayOrder = 6, IsActive = true, ProductCount = 1 }
        };

        return Ok(fallbackCategories);
    }

    /// <summary>
    /// Creates a new category for a tenant.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Category name is required." });
        }

        var normalizedTenantId = (dto.TenantId ?? "faesthatic-corner").Trim().ToLowerInvariant();
        var slug = !string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Slug.Trim().ToLowerInvariant()
            : dto.Name.Trim().ToLowerInvariant().Replace(" ", "-");

        if (_context != null)
        {
            var exists = await _context.Categories.AnyAsync(c => c.TenantId == normalizedTenantId && c.Slug == slug);
            if (exists)
            {
                return Conflict(new { message = $"Category with slug '{slug}' already exists." });
            }

            var category = new Category
            {
                TenantId = normalizedTenantId,
                Name = dto.Name.Trim(),
                Slug = slug,
                Description = dto.Description,
                DisplayOrder = dto.DisplayOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { tenantId = normalizedTenantId }, new CategoryDto
            {
                Id = category.Id,
                TenantId = category.TenantId,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                ProductCount = 0
            });
        }

        return Ok(new CategoryDto
        {
            Id = 999,
            TenantId = normalizedTenantId,
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true,
            ProductCount = 0
        });
    }

    /// <summary>
    /// Deletes a category if no active products are associated with it.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        if (_context != null)
        {
            var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
            {
                return NotFound(new { message = $"Category with ID {id} not found." });
            }

            if (category.Products.Any(p => p.IsActive))
            {
                return BadRequest(new { message = "Cannot delete category with active products assigned. Reassign or delete the products first." });
            }

            category.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return NoContent();
        }

        return NoContent();
    }
}

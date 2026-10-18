using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Domain.Entities;
using CommerceSaaS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UomsController : ControllerBase
{
    private readonly ApplicationDbContext? _context;
    private readonly ILogger<UomsController> _logger;

    public UomsController(IServiceProvider serviceProvider, ILogger<UomsController> logger)
    {
        _context = serviceProvider.GetService<ApplicationDbContext>();
        _logger = logger;
    }

    /// <summary>
    /// Gets all Units of Measurement (UOM) for a tenant.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UomDto>>> GetUnitsOfMeasurement([FromQuery] string tenantId = "faesthatic-corner")
    {
        var normalizedTenantId = tenantId.Trim().ToLowerInvariant();

        if (_context != null)
        {
            var uoms = await _context.UnitsOfMeasurement
                .Where(u => u.TenantId == normalizedTenantId && u.IsActive)
                .OrderBy(u => u.Id)
                .Select(u => new UomDto
                {
                    Id = u.Id,
                    TenantId = u.TenantId,
                    Code = u.Code,
                    Name = u.Name,
                    Description = u.Description,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            if (uoms.Count > 0)
            {
                return Ok(uoms);
            }
        }

        // Standard default UOM fallback list
        var defaultUoms = new List<UomDto>
        {
            new() { Id = 1, TenantId = normalizedTenantId, Code = "PCS", Name = "Pieces", Description = "Individual item unit", IsActive = true },
            new() { Id = 2, TenantId = normalizedTenantId, Code = "PACK", Name = "Pack", Description = "Packaged bundle", IsActive = true },
            new() { Id = 3, TenantId = normalizedTenantId, Code = "SET", Name = "Set", Description = "Matching set", IsActive = true },
            new() { Id = 4, TenantId = normalizedTenantId, Code = "BOX", Name = "Presentation Box", Description = "Gift presentation box", IsActive = true },
            new() { Id = 5, TenantId = normalizedTenantId, Code = "KG", Name = "Kilogram", Description = "Kilograms", IsActive = true },
            new() { Id = 6, TenantId = normalizedTenantId, Code = "GM", Name = "Grams", Description = "Grams", IsActive = true },
            new() { Id = 7, TenantId = normalizedTenantId, Code = "MTR", Name = "Meters", Description = "Meters", IsActive = true }
        };

        return Ok(defaultUoms);
    }

    /// <summary>
    /// Creates a new Unit of Measurement for a tenant.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UomDto>> CreateUnitOfMeasurement([FromBody] CreateUomDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "UOM code and name are required." });
        }

        var normalizedTenantId = (dto.TenantId ?? "faesthatic-corner").Trim().ToLowerInvariant();
        var code = dto.Code.Trim().ToUpperInvariant();

        if (_context != null)
        {
            var exists = await _context.UnitsOfMeasurement.AnyAsync(u => u.TenantId == normalizedTenantId && u.Code == code);
            if (exists)
            {
                return Conflict(new { message = $"UOM code '{code}' already exists for this store." });
            }

            var uom = new UnitOfMeasurement
            {
                TenantId = normalizedTenantId,
                Code = code,
                Name = dto.Name.Trim(),
                Description = dto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.UnitsOfMeasurement.Add(uom);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUnitsOfMeasurement), new { tenantId = normalizedTenantId }, new UomDto
            {
                Id = uom.Id,
                TenantId = uom.TenantId,
                Code = uom.Code,
                Name = uom.Name,
                Description = uom.Description,
                IsActive = uom.IsActive
            });
        }

        return Ok(new UomDto
        {
            Id = 999,
            TenantId = normalizedTenantId,
            Code = code,
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true
        });
    }

    /// <summary>
    /// Deletes a Unit of Measurement.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUnitOfMeasurement(int id)
    {
        if (_context != null)
        {
            var uom = await _context.UnitsOfMeasurement.FindAsync(id);
            if (uom == null)
            {
                return NotFound(new { message = $"UOM with ID {id} not found." });
            }

            uom.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
}

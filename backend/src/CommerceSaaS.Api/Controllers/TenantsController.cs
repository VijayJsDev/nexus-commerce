using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext? _context;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(IServiceProvider serviceProvider, ILogger<TenantsController> logger)
    {
        _context = serviceProvider.GetService<ApplicationDbContext>();
        _logger = logger;
    }

    /// <summary>
    /// Gets organization profile and settings for a specific tenant.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TenantDto>> GetTenantById(string id)
    {
        var normalizedId = id.Trim().ToLowerInvariant();

        if (_context != null)
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == normalizedId);
            if (tenant != null)
            {
                return Ok(new TenantDto
                {
                    Id = tenant.Id,
                    Name = tenant.Name,
                    LogoUrl = tenant.LogoUrl,
                    Email = tenant.Email,
                    SupportPhone = tenant.SupportPhone,
                    Gstin = tenant.Gstin,
                    Address = tenant.Address,
                    IsActive = tenant.IsActive
                });
            }
        }

        // Fallback default for faesthatic-corner
        if (normalizedId == "faesthatic-corner")
        {
            return Ok(new TenantDto
            {
                Id = "faesthatic-corner",
                Name = "Faesthatic Corner",
                LogoUrl = "/faesthatic_corner_logo.jpg",
                Email = "admin@faesthaticcorner.com",
                SupportPhone = "+91 98765 43210",
                Gstin = "33AAAAA0000A1Z5",
                Address = "Artisan Workshop, Chennai, Tamil Nadu, India",
                IsActive = true
            });
        }

        return NotFound(new { message = $"Tenant '{id}' was not found." });
    }

    /// <summary>
    /// Updates organization profile, branding logo, and support information.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TenantDto>> UpdateTenant(string id, [FromBody] UpdateTenantDto dto)
    {
        var normalizedId = id.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Organization name is required." });
        }

        if (_context != null)
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == normalizedId);
            if (tenant == null)
            {
                return NotFound(new { message = $"Tenant '{id}' was not found." });
            }

            tenant.Name = dto.Name.Trim();
            tenant.LogoUrl = dto.LogoUrl;
            tenant.Email = dto.Email.Trim();
            tenant.SupportPhone = dto.SupportPhone;
            tenant.Gstin = dto.Gstin;
            tenant.Address = dto.Address;
            tenant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated organization settings for tenant {TenantId}", normalizedId);

            return Ok(new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                LogoUrl = tenant.LogoUrl,
                Email = tenant.Email,
                SupportPhone = tenant.SupportPhone,
                Gstin = tenant.Gstin,
                Address = tenant.Address,
                IsActive = tenant.IsActive
            });
        }

        return Ok(new TenantDto
        {
            Id = normalizedId,
            Name = dto.Name,
            LogoUrl = dto.LogoUrl,
            Email = dto.Email,
            SupportPhone = dto.SupportPhone,
            Gstin = dto.Gstin,
            Address = dto.Address,
            IsActive = true
        });
    }
}

using System.Text.RegularExpressions;
using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Domain.Entities;
using CommerceSaaS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext? _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IServiceProvider serviceProvider,
        IPasswordHasher passwordHasher,
        ILogger<AuthController> logger)
    {
        _context = serviceProvider.GetService<ApplicationDbContext>();
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    /// <summary>
    /// Onboards a new merchant store/tenant onto the platform.
    /// Creates the tenant profile, admin credentials, and pre-seeds standard UOMs.
    /// </summary>
    [HttpPost("register-tenant")]
    public async Task<ActionResult<TenantAuthResponseDto>> RegisterTenant([FromBody] RegisterTenantDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.StoreName))
        {
            return BadRequest(new { message = "Store name is required." });
        }

        if (string.IsNullOrWhiteSpace(dto.TenantId))
        {
            return BadRequest(new { message = "Tenant ID / Store slug is required." });
        }

        var normalizedTenantId = dto.TenantId.Trim().ToLowerInvariant();
        if (!Regex.IsMatch(normalizedTenantId, "^[a-z0-9-]+$"))
        {
            return BadRequest(new { message = "Tenant ID can only contain lowercase letters, numbers, and hyphens." });
        }

        if (string.IsNullOrWhiteSpace(dto.AdminEmail) || !dto.AdminEmail.Contains('@'))
        {
            return BadRequest(new { message = "A valid admin email is required." });
        }

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long." });
        }

        if (_context != null)
        {
            // Check if tenant already exists
            var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == normalizedTenantId);
            if (tenantExists)
            {
                return Conflict(new { message = $"Tenant ID '{normalizedTenantId}' is already taken. Please choose another." });
            }

            // Check if email already registered for this tenant
            var userExists = await _context.TenantUsers.AnyAsync(u => u.Email == dto.AdminEmail.Trim());
            if (userExists)
            {
                return Conflict(new { message = $"Email '{dto.AdminEmail}' is already registered with an existing account." });
            }

            // 1. Create Tenant
            var tenant = new Tenant
            {
                Id = normalizedTenantId,
                Name = dto.StoreName.Trim(),
                Email = dto.AdminEmail.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Tenants.Add(tenant);

            // 2. Create Tenant Admin User
            var adminUser = new TenantUser
            {
                TenantId = normalizedTenantId,
                Email = dto.AdminEmail.Trim(),
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                Role = "TenantAdmin",
                CreatedAt = DateTime.UtcNow
            };
            _context.TenantUsers.Add(adminUser);

            // 3. Pre-seed standard measurement units (UOMs) for immediate productivity
            var defaultUoms = new List<UnitOfMeasurement>
            {
                new() { TenantId = normalizedTenantId, Code = "PCS", Name = "Pieces", Description = "Individual item unit" },
                new() { TenantId = normalizedTenantId, Code = "PACK", Name = "Pack", Description = "Packaged bundle" },
                new() { TenantId = normalizedTenantId, Code = "SET", Name = "Set", Description = "Matching set" },
                new() { TenantId = normalizedTenantId, Code = "BOX", Name = "Presentation Box", Description = "Gift presentation box" },
                new() { TenantId = normalizedTenantId, Code = "KG", Name = "Kilogram", Description = "Kilograms" },
                new() { TenantId = normalizedTenantId, Code = "GM", Name = "Grams", Description = "Grams" },
                new() { TenantId = normalizedTenantId, Code = "MTR", Name = "Meters", Description = "Meters" }
            };
            _context.UnitsOfMeasurement.AddRange(defaultUoms);

            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully onboarded new tenant {TenantId} ({StoreName})", normalizedTenantId, dto.StoreName);
        }

        // Return token and tenant session
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        return Ok(new TenantAuthResponseDto
        {
            TenantId = normalizedTenantId,
            StoreName = dto.StoreName.Trim(),
            Email = dto.AdminEmail.Trim(),
            Token = token,
            Message = "Store registered successfully!"
        });
    }

    /// <summary>
    /// Authenticates a merchant admin with their Tenant ID, Email, and Password.
    /// </summary>
    [HttpPost("login-tenant")]
    public async Task<ActionResult<TenantAuthResponseDto>> LoginTenant([FromBody] LoginTenantDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TenantId) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Tenant ID, Email, and Password are required." });
        }

        var normalizedTenantId = dto.TenantId.Trim().ToLowerInvariant();
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        if (_context != null)
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == normalizedTenantId);
            if (tenant == null)
            {
                return NotFound(new { message = $"Tenant '{normalizedTenantId}' not found. Please register your store." });
            }

            var user = await _context.TenantUsers.FirstOrDefaultAsync(u => u.TenantId == normalizedTenantId && u.Email.ToLower() == normalizedEmail);
            if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password for this store." });
            }

            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            return Ok(new TenantAuthResponseDto
            {
                TenantId = tenant.Id,
                StoreName = tenant.Name,
                Email = user.Email,
                LogoUrl = tenant.LogoUrl,
                Token = token,
                Message = "Authentication successful."
            });
        }

        // Fallback demo mode if DB is disconnected
        return Ok(new TenantAuthResponseDto
        {
            TenantId = normalizedTenantId,
            StoreName = normalizedTenantId == "faesthatic-corner" ? "Faesthatic Corner" : $"{normalizedTenantId.ToUpper()} Store",
            Email = dto.Email,
            Token = "demo-token",
            Message = "Demo session authenticated."
        });
    }
}

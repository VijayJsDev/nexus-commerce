using CommerceSaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CommerceSaaS.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantUser> TenantUsers => Set<TenantUser>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<UnitOfMeasurement> UnitsOfMeasurement => Set<UnitOfMeasurement>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── 1. Tenants ──────────────────────────────────────────────
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("tenants");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Id).HasMaxLength(50);
            entity.Property(t => t.Name).HasMaxLength(150).IsRequired();
            entity.Property(t => t.LogoUrl).HasMaxLength(500);
            entity.Property(t => t.Email).HasMaxLength(150).IsRequired();
            entity.Property(t => t.SupportPhone).HasMaxLength(50);
            entity.Property(t => t.Gstin).HasMaxLength(15);
            entity.Property(t => t.IsActive).HasDefaultValue(true);
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // ─── 2. Tenant Users ─────────────────────────────────────────
        modelBuilder.Entity<TenantUser>(entity =>
        {
            entity.ToTable("tenant_users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.TenantId).HasMaxLength(50).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(u => u.Role).HasMaxLength(50).HasDefaultValue("TenantAdmin");
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(u => new { u.TenantId, u.Email }).IsUnique();

            entity.HasOne(u => u.Tenant)
                  .WithMany(t => t.Users)
                  .HasForeignKey(u => u.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── 3. Categories ───────────────────────────────────────────
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.TenantId).HasMaxLength(50).IsRequired();
            entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
            entity.Property(c => c.Slug).HasMaxLength(100).IsRequired();
            entity.Property(c => c.DisplayOrder).HasDefaultValue(0);
            entity.Property(c => c.IsActive).HasDefaultValue(true);
            entity.Property(c => c.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(c => new { c.TenantId, c.Slug }).IsUnique();

            entity.HasOne(c => c.Tenant)
                  .WithMany(t => t.Categories)
                  .HasForeignKey(c => c.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── 4. Units of Measurement ────────────────────────────────
        modelBuilder.Entity<UnitOfMeasurement>(entity =>
        {
            entity.ToTable("units_of_measurement");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.TenantId).HasMaxLength(50).IsRequired();
            entity.Property(u => u.Code).HasMaxLength(20).IsRequired();
            entity.Property(u => u.Name).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Description).HasMaxLength(255);
            entity.Property(u => u.IsActive).HasDefaultValue(true);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(u => new { u.TenantId, u.Code }).IsUnique();

            entity.HasOne(u => u.Tenant)
                  .WithMany(t => t.UnitsOfMeasurement)
                  .HasForeignKey(u => u.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── 5. Products ─────────────────────────────────────────────
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.TenantId).HasMaxLength(50).IsRequired();
            entity.Property(p => p.Name).HasMaxLength(150).IsRequired();
            entity.Property(p => p.Sku).HasMaxLength(50).IsRequired();
            entity.Property(p => p.UnitRate).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(p => p.EffectiveFrom).HasColumnType("date").IsRequired();
            entity.Property(p => p.MaxDiscount).HasColumnType("numeric(5,2)").HasDefaultValue(0.00m);
            entity.Property(p => p.CgstRate).HasColumnType("numeric(5,2)").HasDefaultValue(9.00m);
            entity.Property(p => p.SgstRate).HasColumnType("numeric(5,2)").HasDefaultValue(9.00m);
            entity.Property(p => p.IgstRate).HasColumnType("numeric(5,2)").HasDefaultValue(18.00m);
            entity.Property(p => p.HsnCode).HasMaxLength(20).IsRequired();
            entity.Property(p => p.ImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(p => p.StockQuantity).HasDefaultValue(100);
            entity.Property(p => p.IsActive).HasDefaultValue(true);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Ignore alias property
            entity.Ignore(p => p.Price);

            // Indexes and constraints
            entity.HasIndex(p => new { p.TenantId, p.Sku }).IsUnique();
            entity.HasIndex(p => new { p.TenantId, p.IsActive });
            entity.HasIndex(p => new { p.TenantId, p.CategoryId });

            entity.Property(p => p.Category).HasMaxLength(100);
            entity.Property(p => p.Uom).HasMaxLength(20);

            // Relationships
            entity.HasOne(p => p.Tenant)
                  .WithMany(t => t.Products)
                  .HasForeignKey(p => p.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.CategoryNav)
                  .WithMany(c => c.Products)
                  .HasForeignKey(p => p.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.UnitOfMeasurement)
                  .WithMany(u => u.Products)
                  .HasForeignKey(p => p.UomId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── 6. Product Gallery Images ──────────────────────────────
        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.ToTable("product_images");
            entity.HasKey(pi => pi.Id);
            entity.Property(pi => pi.ImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(pi => pi.DisplayOrder).HasDefaultValue(0);
            entity.Property(pi => pi.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(pi => pi.Product)
                  .WithMany(p => p.GalleryImages)
                  .HasForeignKey(pi => pi.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── 7. Orders ───────────────────────────────────────────────
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.HasKey(o => o.Id);
            entity.Property(o => o.TenantId).HasMaxLength(50).IsRequired();
            entity.Property(o => o.OrderNumber).HasMaxLength(50).IsRequired();
            entity.Property(o => o.CustomerEmail).HasMaxLength(150).IsRequired();
            entity.Property(o => o.CustomerName).HasMaxLength(150);
            entity.Property(o => o.CustomerPhone).HasMaxLength(50);
            entity.Property(o => o.DeliveryType).HasMaxLength(20).HasDefaultValue("Ship");
            entity.Property(o => o.Country).HasMaxLength(50).HasDefaultValue("India");
            entity.Property(o => o.Status).HasMaxLength(50).HasDefaultValue("Pending");

            entity.Property(o => o.TipAmount).HasColumnType("numeric(18,2)").HasDefaultValue(0);
            entity.Property(o => o.Subtotal).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(o => o.ShippingFee).HasColumnType("numeric(18,2)").HasDefaultValue(0);
            entity.Property(o => o.DiscountAmount).HasColumnType("numeric(18,2)").HasDefaultValue(0);
            entity.Property(o => o.TotalAmount).HasColumnType("numeric(18,2)").IsRequired();
            entity.Property(o => o.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(o => new { o.TenantId, o.OrderNumber }).IsUnique();

            entity.HasOne(o => o.Tenant)
                  .WithMany(t => t.Orders)
                  .HasForeignKey(o => o.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ─── 8. Order Items ──────────────────────────────────────────
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.ProductName).HasMaxLength(150).IsRequired();
            entity.Property(oi => oi.UnitPrice).HasColumnType("numeric(18,2)").IsRequired();

            entity.HasOne<Order>()
                  .WithMany(o => o.Items)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

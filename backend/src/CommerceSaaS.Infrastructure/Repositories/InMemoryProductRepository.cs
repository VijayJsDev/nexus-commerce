using System.Collections.Concurrent;
using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Domain.Entities;

namespace CommerceSaaS.Infrastructure.Repositories;

public class InMemoryProductRepository : IProductRepository
{
    private readonly ConcurrentDictionary<int, Product> _products = new();

    public InMemoryProductRepository()
    {
        // Seed default store catalog
        var seedProducts = new List<Product>
        {
            new() { Id = 1, Name = "Flower Tape D. Green", Price = 16.00m, ImageUrl = "/product_image_1.jpg", Category = "Floral Tape", Description = "Premium florist stretch tape for stem wrapping and delicate craft binding." },
            new() { Id = 2, Name = "Yellow Daisy Floral Bouquet Flower Card - 5 pieces pack", Price = 75.00m, ImageUrl = "/product_image_2.jpg", Category = "Floral Cards", Description = "Handcrafted daisy bouquet message cards printed on textured cardstock." },
            new() { Id = 3, Name = "Yellow & White Daisy Floral Bouquet Flower Card - 5 pieces pack", Price = 75.00m, ImageUrl = "/product_image_3.jpg", Category = "Floral Cards", Description = "Artisan dual-tone daisy greeting cards with satin ribbon ties." },
            new() { Id = 4, Name = "Resin Ocean Tray", Price = 89.00m, ImageUrl = "/product_image_1.jpg", Category = "Resin Decor", Description = "Hand-poured ocean wave resin serving tray with natural wooden base." },
            new() { Id = 5, Name = "Floral Geode Coaster Set", Price = 55.00m, ImageUrl = "/product_image_2.jpg", Category = "Resin Coasters", Description = "Set of 4 botanical gold-leaf edged crystal resin coasters." },
            new() { Id = 6, Name = "Lavender Bouquet Keepsake", Price = 120.00m, ImageUrl = "/product_image_3.jpg", Category = "Gift Sets", Description = "Preserved lavender blooms arranged inside a handmade presentation box." },
            new() { Id = 7, Name = "Emerald Wave Clock", Price = 110.00m, ImageUrl = "/product_image_1.jpg", Category = "Wall Clocks", Description = "Silent quartz wall clock styled with deep emerald resin artistry." },
            new() { Id = 8, Name = "Rose Quartz Trinket Dish", Price = 45.00m, ImageUrl = "/product_image_2.jpg", Category = "Trinkets", Description = "Iridescent quartz-inspired resin tray for delicate jewelry storage." },
        };

        foreach (var p in seedProducts)
        {
            _products[p.Id] = p;
        }
    }

    public Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return Task.FromResult<IEnumerable<Product>>(_products.Values.Where(p => p.IsActive).OrderBy(p => p.Id));
    }

    public Task<Product?> GetProductByIdAsync(int id)
    {
        _products.TryGetValue(id, out var product);
        return Task.FromResult(product);
    }

    public Task<Product> CreateProductAsync(Product product)
    {
        if (product.Id == 0)
        {
            product.Id = _products.Keys.Any() ? _products.Keys.Max() + 1 : 1;
        }
        product.CreatedAt = DateTime.UtcNow;
        _products[product.Id] = product;
        return Task.FromResult(product);
    }
}

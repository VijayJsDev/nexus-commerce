namespace CommerceSaaS.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string DeliveryType { get; set; } = "Ship"; // "Ship" | "Pickup"
    public string? ShippingAddress { get; set; }
    public string? Apartment { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; } = "India";
    public string? PickupLocation { get; set; }
    public bool BillingSameAsShipping { get; set; } = true;
    public string? BillingAddress { get; set; }
    public decimal TipAmount { get; set; } = 0;
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public string? SpecialInstructions { get; set; }
    public string Status { get; set; } = "Pending"; // "Pending", "Confirmed", "Shipped", "Cancelled"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = [];
}

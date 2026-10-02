using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderRepository _orderRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        IOrderRepository orderRepository,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<OrdersController> logger)
    {
        _orderRepository = orderRepository;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
    {
        var orders = await _orderRepository.GetAllOrdersAsync();
        var dtos = orders.Select(MapToDto);
        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(Guid id)
    {
        var order = await _orderRepository.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(new { message = $"Order with ID {id} was not found." });
        }
        return Ok(MapToDto(order));
    }

    [HttpGet("test-email")]
    public async Task<IActionResult> TestEmail([FromQuery] string? email)
    {
        var target = string.IsNullOrWhiteSpace(email) ? "kv077145@gmail.com" : email;
        var (success, message, details) = await _emailService.TestEmailDeliveryAsync(target);
        return Ok(new
        {
            success,
            message,
            details,
            targetEmail = target,
            timestamp = DateTime.UtcNow
        });
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CustomerEmail))
        {
            return BadRequest(new { message = "Customer email is required." });
        }

        if (dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest(new { message = "Order must contain at least one item." });
        }

        var customerFullName = $"{dto.FirstName} {dto.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(customerFullName))
        {
            customerFullName = "Valued Customer";
        }

        var orderItems = dto.Items.Select(i => new OrderItem
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            UnitPrice = i.UnitPrice,
            Quantity = Math.Max(1, i.Quantity)
        }).ToList();

        var subtotal = orderItems.Sum(i => i.TotalPrice);
        var grandTotal = Math.Max(0, subtotal - dto.DiscountAmount + dto.ShippingFee + dto.TipAmount);

        var order = new Order
        {
            CustomerEmail = dto.CustomerEmail,
            CustomerName = customerFullName,
            CustomerPhone = dto.Phone,
            DeliveryType = string.IsNullOrWhiteSpace(dto.DeliveryType) ? "Ship" : dto.DeliveryType,
            ShippingAddress = dto.Address,
            Apartment = dto.Apartment,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            Country = dto.Country ?? "India",
            PickupLocation = dto.PickupLocation,
            BillingSameAsShipping = dto.BillingSameAsShipping,
            BillingAddress = dto.BillingAddress,
            TipAmount = dto.TipAmount,
            ShippingFee = dto.ShippingFee,
            DiscountAmount = dto.DiscountAmount,
            Subtotal = subtotal,
            TotalAmount = grandTotal,
            SpecialInstructions = dto.SpecialInstructions,
            Status = "Pending",
            Items = orderItems
        };

        var savedOrder = await _orderRepository.CreateOrderAsync(order);
        var orderDto = MapToDto(savedOrder);

        // Notify Super Admin via Email
        var adminEmail = _configuration["Resend:SuperAdminEmail"] ?? "kv077145@gmail.com";
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendOrderNotificationEmailAsync(orderDto, adminEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Background error sending order notification email for #{OrderNumber}", orderDto.OrderNumber);
            }
        });

        return CreatedAtAction(nameof(GetOrderById), new { id = savedOrder.Id }, orderDto);
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerEmail = order.CustomerEmail,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            DeliveryType = order.DeliveryType,
            ShippingAddress = order.ShippingAddress,
            Apartment = order.Apartment,
            City = order.City,
            State = order.State,
            PostalCode = order.PostalCode,
            Country = order.Country,
            PickupLocation = order.PickupLocation,
            BillingSameAsShipping = order.BillingSameAsShipping,
            BillingAddress = order.BillingAddress,
            TipAmount = order.TipAmount,
            Subtotal = order.Subtotal,
            ShippingFee = order.ShippingFee,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            SpecialInstructions = order.SpecialInstructions,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}

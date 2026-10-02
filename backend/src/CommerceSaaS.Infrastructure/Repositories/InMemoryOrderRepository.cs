using System.Collections.Concurrent;
using CommerceSaaS.Application.Interfaces;
using CommerceSaaS.Domain.Entities;

namespace CommerceSaaS.Infrastructure.Repositories;

public class InMemoryOrderRepository : IOrderRepository
{
    private readonly ConcurrentDictionary<Guid, Order> _orders = new();
    private static int _orderCounter = 1000;

    public Task<Order> CreateOrderAsync(Order order)
    {
        if (order.Id == Guid.Empty)
        {
            order.Id = Guid.NewGuid();
        }

        if (string.IsNullOrWhiteSpace(order.OrderNumber))
        {
            var counter = Interlocked.Increment(ref _orderCounter);
            order.OrderNumber = $"FC-{counter}";
        }

        order.CreatedAt = DateTime.UtcNow;
        _orders[order.Id] = order;

        return Task.FromResult(order);
    }

    public Task<IEnumerable<Order>> GetAllOrdersAsync()
    {
        return Task.FromResult<IEnumerable<Order>>(_orders.Values.OrderByDescending(o => o.CreatedAt));
    }

    public Task<Order?> GetOrderByIdAsync(Guid id)
    {
        _orders.TryGetValue(id, out var order);
        return Task.FromResult(order);
    }
}

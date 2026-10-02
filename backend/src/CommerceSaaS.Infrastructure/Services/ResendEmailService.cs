using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CommerceSaaS.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendOrderNotificationEmailAsync(OrderDto order, string superAdminEmail)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        var fromEmail = _configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";
        var configuredAdmin = _configuration["Resend:SuperAdminEmail"];

        var recipientEmail = !string.IsNullOrWhiteSpace(superAdminEmail)
            ? superAdminEmail
            : (!string.IsNullOrWhiteSpace(configuredAdmin) ? configuredAdmin : "kv077145@gmail.com");

        var htmlContent = BuildOrderEmailHtml(order);

        // Development fallback: if no API key is set, log the full email output
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("================================================================================");
            _logger.LogInformation("RESEND EMAIL SERVICE (DEV FALLBACK - NO API KEY CONFIGURED)");
            _logger.LogInformation("Recipient (Super Admin): {Recipient}", recipientEmail);
            _logger.LogInformation("Subject: New Order Received - #{OrderNumber}", order.OrderNumber);
            _logger.LogInformation("Customer: {Customer} ({Email}, {Phone})", order.CustomerName, order.CustomerEmail, order.CustomerPhone);
            _logger.LogInformation("Delivery: {DeliveryType} | Total: Rs. {Total}", order.DeliveryType, order.TotalAmount);
            _logger.LogInformation("Items Count: {Count}", order.Items.Count);
            foreach (var item in order.Items)
            {
                _logger.LogInformation("  - {ItemName} x{Qty} @ Rs. {Price} = Rs. {Total}", item.ProductName, item.Quantity, item.UnitPrice, item.TotalPrice);
            }
            _logger.LogInformation("================================================================================");
            return true;
        }

        try
        {
            var payload = new
            {
                from = fromEmail,
                to = new[] { recipientEmail },
                subject = $"New Order #{order.OrderNumber} - {order.CustomerName ?? order.CustomerEmail}",
                html = htmlContent
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Successfully sent order notification email for #{OrderNumber} to {Recipient} via Resend", order.OrderNumber, recipientEmail);
                return true;
            }

            var errorBody = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Resend API responded with {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order email via Resend for #{OrderNumber}", order.OrderNumber);
            return false;
        }
    }

    private static string BuildOrderEmailHtml(OrderDto order)
    {
        var itemsHtml = new StringBuilder();
        foreach (var item in order.Items)
        {
            itemsHtml.Append($@"
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #e5e7eb;'>{item.ProductName}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;'>{item.Quantity}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;'>₹{item.UnitPrice:N2}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;'>₹{item.TotalPrice:N2}</td>
                </tr>");
        }

        var deliveryDetails = order.DeliveryType == "Pickup"
            ? $@"<p><strong>Pickup Location:</strong> {order.PickupLocation ?? "Chennai Warehouse (Gandhi Road, Nedungundram, Chennai TN)"}</p>"
            : $@"<p><strong>Delivery Address:</strong><br />
                 {order.ShippingAddress} {order.Apartment}<br />
                 {order.City}, {order.State} - {order.PostalCode}<br />
                 {order.Country}</p>";

        var specialNotes = !string.IsNullOrWhiteSpace(order.SpecialInstructions)
            ? $@"<div style='background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0;'>
                    <strong>Special Instructions:</strong> {order.SpecialInstructions}
                 </div>"
            : "";

        return $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>New Order #{order.OrderNumber}</title>
        </head>
        <body style='font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #111827;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 24px;'>
                <div style='border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;'>
                    <h2 style='margin: 0; color: #1e40af;'>🎉 New Store Order Received!</h2>
                    <p style='margin: 4px 0 0 0; color: #6b7280; font-size: 14px;'>Order Number: <strong>#{order.OrderNumber}</strong></p>
                </div>

                <div style='margin-bottom: 20px;'>
                    <h3 style='margin-bottom: 8px; font-size: 16px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;'>Customer Information</h3>
                    <p style='margin: 4px 0;'><strong>Name:</strong> {order.CustomerName ?? "Customer"}</p>
                    <p style='margin: 4px 0;'><strong>Email:</strong> {order.CustomerEmail}</p>
                    <p style='margin: 4px 0;'><strong>Phone:</strong> {order.CustomerPhone ?? "Not provided"}</p>
                    <p style='margin: 4px 0;'><strong>Delivery Method:</strong> {order.DeliveryType}</p>
                    {deliveryDetails}
                    {specialNotes}
                </div>

                <div style='margin-bottom: 20px;'>
                    <h3 style='margin-bottom: 8px; font-size: 16px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;'>Ordered Items</h3>
                    <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                        <thead>
                            <tr style='background-color: #f3f4f6; text-align: left;'>
                                <th style='padding: 8px 10px;'>Product</th>
                                <th style='padding: 8px 10px; text-align: center;'>Qty</th>
                                <th style='padding: 8px 10px; text-align: right;'>Price</th>
                                <th style='padding: 8px 10px; text-align: right;'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsHtml}
                        </tbody>
                    </table>
                </div>

                <div style='background-color: #f9fafb; padding: 14px; border-radius: 6px; margin-top: 15px;'>
                    <table style='width: 100%; font-size: 14px;'>
                        <tr>
                            <td style='color: #6b7280;'>Subtotal:</td>
                            <td style='text-align: right;'>₹{order.Subtotal:N2}</td>
                        </tr>
                        <tr>
                            <td style='color: #6b7280;'>Shipping:</td>
                            <td style='text-align: right;'>{(order.ShippingFee == 0 ? "FREE" : $"₹{order.ShippingFee:N2}")}</td>
                        </tr>
                        {(order.TipAmount > 0 ? $@"
                        <tr>
                            <td style='color: #6b7280;'>Tip:</td>
                            <td style='text-align: right;'>₹{order.TipAmount:N2}</td>
                        </tr>" : "")}
                        {(order.DiscountAmount > 0 ? $@"
                        <tr>
                            <td style='color: #10b981;'>Discount:</td>
                            <td style='text-align: right; color: #10b981;'>-₹{order.DiscountAmount:N2}</td>
                        </tr>" : "")}
                        <tr style='font-size: 16px; font-weight: bold; border-top: 1px solid #e5e7eb;'>
                            <td style='padding-top: 8px;'>Grand Total:</td>
                            <td style='padding-top: 8px; text-align: right; color: #1e40af;'>₹{order.TotalAmount:N2}</td>
                        </tr>
                    </table>
                </div>

                <div style='margin-top: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 12px;'>
                    <p style='margin: 0;'>Faesthatic Corner / Craft Supplies Order Management System</p>
                </div>
            </div>
        </body>
        </html>";
    }
}

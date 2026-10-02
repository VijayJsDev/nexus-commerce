using System.Net.Http.Headers;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using CommerceSaaS.Application.DTOs;
using CommerceSaaS.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CommerceSaaS.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

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

    private string? GetApiKey()
    {
        var key = _configuration["Resend:ApiKey"]
            ?? _configuration["Resend__ApiKey"]
            ?? _configuration["RESEND_API_KEY"]
            ?? Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? Environment.GetEnvironmentVariable("Resend__ApiKey");

        return string.IsNullOrWhiteSpace(key) ? null : key.Trim();
    }

    private string GetFromEmail()
    {
        var from = _configuration["Resend:FromEmail"]
            ?? _configuration["Resend__FromEmail"]
            ?? _configuration["RESEND_FROM_EMAIL"]
            ?? Environment.GetEnvironmentVariable("RESEND_FROM_EMAIL");

        return string.IsNullOrWhiteSpace(from) ? "onboarding@resend.dev" : from.Trim();
    }

    private string GetAdminEmail(string? overrideEmail = null)
    {
        if (!string.IsNullOrWhiteSpace(overrideEmail))
        {
            return overrideEmail.Trim();
        }

        var admin = _configuration["Resend:SuperAdminEmail"]
            ?? _configuration["Resend__SuperAdminEmail"]
            ?? _configuration["SUPER_ADMIN_EMAIL"]
            ?? Environment.GetEnvironmentVariable("SUPER_ADMIN_EMAIL");

        return string.IsNullOrWhiteSpace(admin) ? "kv077145@gmail.com" : admin.Trim();
    }

    public async Task<(bool Success, string Message, string Details)> SendOrderNotificationEmailAsync(OrderDto order, string superAdminEmail)
    {
        var apiKey = GetApiKey();
        var fromEmail = GetFromEmail();
        var recipientEmail = GetAdminEmail(superAdminEmail);

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("RESEND EMAIL SERVICE (DEV FALLBACK - NO API KEY DETECTED)");
            return (true, "No API key configured (Dev Fallback)", "Logged to console.");
        }

        try
        {
            var htmlContent = BuildOrderEmailHtml(order);
            var subjectText = $"New Order #{order.OrderNumber} - Faesthatic Corner";

            var payload = new
            {
                from = fromEmail,
                to = new[] { recipientEmail },
                subject = subjectText,
                html = htmlContent
            };

            var jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Successfully sent order notification email for #{OrderNumber} to {Recipient} via Resend. Response: {Response}",
                    order.OrderNumber, recipientEmail, responseBody);
                return (true, $"Order email sent to {recipientEmail} via Resend", responseBody);
            }

            _logger.LogWarning("Resend API responded with error HTTP {StatusCode}: {ErrorBody}", response.StatusCode, responseBody);
            return (false, $"Resend API error HTTP {(int)response.StatusCode}", responseBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order email via Resend for #{OrderNumber}", order.OrderNumber);
            return (false, $"Exception: {ex.Message}", ex.ToString());
        }
    }

    public async Task<(bool Success, string Message, string Details)> TestEmailDeliveryAsync(string targetEmail)
    {
        var apiKey = GetApiKey();
        var fromEmail = GetFromEmail();
        var recipient = GetAdminEmail(targetEmail);

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return (false, "No Resend API Key detected in environment or configuration.",
                "Set Resend__ApiKey or RESEND_API_KEY environment variable.");
        }

        try
        {
            var maskedKey = apiKey.Length > 10
                ? $"{apiKey[..6]}...{apiKey[^4..]} ({apiKey.Length} chars)"
                : "(short key)";

            var testHtml = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;'>
                    <h2 style='color: #005bd3;'>Faesthatic Corner - Resend Email Test</h2>
                    <p>This is a live test notification from your deployed .NET 10 backend on Render.</p>
                    <p><strong>Recipient:</strong> {recipient}</p>
                    <p><strong>From:</strong> {fromEmail}</p>
                    <p><strong>Timestamp:</strong> {DateTime.UtcNow:u}</p>
                    <hr style='border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;' />
                    <p style='color: #10b981; font-weight: bold;'>If you see this email, Resend is working properly!</p>
                </div>";

            var payload = new
            {
                from = fromEmail,
                to = new[] { recipient },
                subject = "Live Test: Faesthatic Corner Order Notification System",
                html = testHtml
            };

            var jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                return (true, $"Email dispatched successfully to {recipient} via Resend!",
                    $"HTTP {response.StatusCode} | Key: {maskedKey} | Resend Output: {responseBody}");
            }

            return (false, $"Resend API returned HTTP {(int)response.StatusCode} ({response.StatusCode})",
                $"Key: {maskedKey} | Sender: {fromEmail} | Recipient: {recipient} | Error Body: {responseBody}");
        }
        catch (Exception ex)
        {
            return (false, $"Exception when calling Resend: {ex.Message}", ex.ToString());
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
                    <td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;'>Rs. {item.UnitPrice:N2}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;'>Rs. {item.TotalPrice:N2}</td>
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
                    <h2 style='margin: 0; color: #1e40af;'>New Store Order Received!</h2>
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
                    <h3 style='margin-bottom: 8px; font-size: 16px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;'>Ordered Products</h3>
                    <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                        <thead>
                            <tr style='background-color: #f3f4f6;'>
                                <th style='padding: 8px; text-align: left;'>Product</th>
                                <th style='padding: 8px; text-align: center;'>Qty</th>
                                <th style='padding: 8px; text-align: right;'>Price</th>
                                <th style='padding: 8px; text-align: right;'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsHtml}
                        </tbody>
                    </table>
                </div>

                <div style='background-color: #f9fafb; border-radius: 6px; padding: 16px; margin-bottom: 20px;'>
                    <div style='display: flex; justify-content: space-between; margin-bottom: 4px;'>
                        <span>Subtotal:</span>
                        <span>Rs. {order.Subtotal:N2}</span>
                    </div>
                    {(order.DiscountAmount > 0 ? $@"<div style='display: flex; justify-content: space-between; margin-bottom: 4px; color: #16a34a;'><span>Discount:</span><span>-Rs. {order.DiscountAmount:N2}</span></div>" : "")}
                    <div style='display: flex; justify-content: space-between; margin-bottom: 4px;'>
                        <span>Delivery Fee:</span>
                        <span>{(order.ShippingFee == 0 ? "FREE" : $"Rs. {order.ShippingFee:N2}")}</span>
                    </div>
                    {(order.TipAmount > 0 ? $@"<div style='display: flex; justify-content: space-between; margin-bottom: 4px;'><span>Tip for Team:</span><span>Rs. {order.TipAmount:N2}</span></div>" : "")}
                    <div style='display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;'>
                        <span>Grand Total:</span>
                        <span>Rs. {order.TotalAmount:N2}</span>
                    </div>
                </div>

                <div style='text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px;'>
                    <p style='margin: 0;'>Faesthatic Corner - Super Admin Order Notification</p>
                    <p style='margin: 2px 0 0 0;'>Logged into admin dashboard for order processing.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}

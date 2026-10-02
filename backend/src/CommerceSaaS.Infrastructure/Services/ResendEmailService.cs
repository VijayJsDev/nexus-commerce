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
            var textContent = BuildOrderEmailText(order);
            var subjectText = $"Order #{order.OrderNumber} - {order.CustomerName ?? "Customer"}";
            var formattedFrom = fromEmail.Contains('<') ? fromEmail : $"Faesthatic Corner <{fromEmail}>";

            var payload = new
            {
                from = formattedFrom,
                to = new[] { recipientEmail },
                subject = subjectText,
                html = htmlContent,
                text = textContent
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

            var formattedFrom = fromEmail.Contains('<') ? fromEmail : $"Faesthatic Corner <{fromEmail}>";

            var payload = new
            {
                from = formattedFrom,
                to = new[] { recipient },
                subject = "Live Test: Faesthatic Corner Order Notification System",
                html = testHtml,
                text = $"Live Test Notification: Faesthatic Corner system is active. Recipient: {recipient} at {DateTime.UtcNow:u}"
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

    private static string BuildOrderEmailText(OrderDto order)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"NEW ORDER NOTIFICATION - #{order.OrderNumber}");
        sb.AppendLine($"Customer: {order.CustomerName} ({order.CustomerEmail})");
        sb.AppendLine($"Phone: {order.CustomerPhone ?? "Not provided"}");
        sb.AppendLine($"Delivery: {order.DeliveryType}");
        if (order.DeliveryType == "Pickup")
        {
            sb.AppendLine($"Pickup Location: {order.PickupLocation ?? "Chennai Warehouse"}");
        }
        else
        {
            sb.AppendLine($"Address: {order.ShippingAddress}, {order.City}, {order.State} - {order.PostalCode}");
        }
        sb.AppendLine();
        sb.AppendLine("ITEMS:");
        foreach (var item in order.Items)
        {
            sb.AppendLine($"- {item.ProductName} x{item.Quantity} @ Rs. {item.UnitPrice:N2} = Rs. {item.TotalPrice:N2}");
        }
        sb.AppendLine();
        sb.AppendLine($"Subtotal: Rs. {order.Subtotal:N2}");
        if (order.DiscountAmount > 0) sb.AppendLine($"Discount: -Rs. {order.DiscountAmount:N2}");
        sb.AppendLine($"Delivery Fee: {(order.ShippingFee == 0 ? "FREE" : $"Rs. {order.ShippingFee:N2}")}");
        if (order.TipAmount > 0) sb.AppendLine($"Tip: Rs. {order.TipAmount:N2}");
        sb.AppendLine($"TOTAL: Rs. {order.TotalAmount:N2}");
        return sb.ToString();
    }

    private static string BuildOrderEmailHtml(OrderDto order)
    {
        var itemsHtml = new StringBuilder();
        foreach (var item in order.Items)
        {
            itemsHtml.Append($@"
                <div style='padding: 10px 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between;'>
                    <div>
                        <strong style='color: #111827;'>{item.ProductName}</strong>
                        <div style='font-size: 12px; color: #6b7280;'>Qty: {item.Quantity} x Rs. {item.UnitPrice:N2}</div>
                    </div>
                    <div style='font-weight: bold; color: #111827;'>Rs. {item.TotalPrice:N2}</div>
                </div>");
        }

        var deliveryDetails = order.DeliveryType == "Pickup"
            ? $@"<p style='margin: 4px 0;'><strong>Pickup Location:</strong> {order.PickupLocation ?? "Chennai Warehouse (Gandhi Road, Nedungundram, Chennai TN)"}</p>"
            : $@"<p style='margin: 4px 0;'><strong>Delivery Address:</strong><br />
                 {order.ShippingAddress} {order.Apartment}<br />
                 {order.City}, {order.State} - {order.PostalCode}<br />
                 {order.Country}</p>";

        var specialNotes = !string.IsNullOrWhiteSpace(order.SpecialInstructions)
            ? $@"<div style='background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0; font-size: 13px;'>
                    <strong>Special Instructions:</strong> {order.SpecialInstructions}
                 </div>"
            : "";

        return $@"
        <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 24px; color: #111827;'>
            <div style='border-bottom: 2px solid #005bd3; padding-bottom: 12px; margin-bottom: 20px;'>
                <h2 style='margin: 0; color: #005bd3;'>New Store Order Received</h2>
                <p style='margin: 4px 0 0 0; color: #6b7280; font-size: 14px;'>Order Number: <strong>#{order.OrderNumber}</strong></p>
            </div>

            <div style='margin-bottom: 20px; font-size: 14px;'>
                <h3 style='margin: 0 0 8px 0; font-size: 15px; color: #374151;'>Customer Details</h3>
                <p style='margin: 4px 0;'><strong>Name:</strong> {order.CustomerName ?? "Customer"}</p>
                <p style='margin: 4px 0;'><strong>Email:</strong> {order.CustomerEmail}</p>
                <p style='margin: 4px 0;'><strong>Phone:</strong> {order.CustomerPhone ?? "Not provided"}</p>
                <p style='margin: 4px 0;'><strong>Delivery Method:</strong> {order.DeliveryType}</p>
                {deliveryDetails}
                {specialNotes}
            </div>

            <div style='margin-bottom: 20px;'>
                <h3 style='margin: 0 0 8px 0; font-size: 15px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;'>Items Ordered</h3>
                {itemsHtml}
            </div>

            <div style='background-color: #f9fafb; border-radius: 6px; padding: 16px; margin-bottom: 20px; font-size: 14px;'>
                <div style='margin-bottom: 6px; color: #4b5563;'>Subtotal: <strong style='float: right; color: #111827;'>Rs. {order.Subtotal:N2}</strong></div>
                {(order.DiscountAmount > 0 ? $@"<div style='margin-bottom: 6px; color: #16a34a;'>Discount: <strong style='float: right;'>-Rs. {order.DiscountAmount:N2}</strong></div>" : "")}
                <div style='margin-bottom: 6px; color: #4b5563;'>Delivery: <strong style='float: right; color: #111827;'>{(order.ShippingFee == 0 ? "FREE" : $"Rs. {order.ShippingFee:N2}")}</strong></div>
                {(order.TipAmount > 0 ? $@"<div style='margin-bottom: 6px; color: #4b5563;'>Tip: <strong style='float: right; color: #111827;'>Rs. {order.TipAmount:N2}</strong></div>" : "")}
                <div style='font-size: 16px; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 8px; color: #111827;'>
                    Total: <span style='float: right; color: #005bd3;'>Rs. {order.TotalAmount:N2}</span>
                </div>
            </div>

            <div style='text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 12px;'>
                <p style='margin: 0;'>Faesthatic Corner · Store Admin Notification</p>
            </div>
        </div>";
    }
}

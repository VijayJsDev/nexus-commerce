using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using CommerceSaaS.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CommerceSaaS.Infrastructure.Services;

public class CloudinaryImageUploadService : IImageUploadService
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<CloudinaryImageUploadService> _logger;

    public CloudinaryImageUploadService(IConfiguration configuration, ILogger<CloudinaryImageUploadService> logger)
    {
        _logger = logger;

        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (!string.IsNullOrWhiteSpace(cloudName) &&
            !string.IsNullOrWhiteSpace(apiKey) &&
            !string.IsNullOrWhiteSpace(apiSecret))
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }
        else
        {
            _logger.LogWarning("Cloudinary credentials not fully configured. Image uploads will fail.");
        }
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string folder = "products")
    {
        if (_cloudinary == null)
        {
            throw new InvalidOperationException("Cloudinary service is not properly configured with credentials.");
        }

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = $"nexus_commerce/{folder}",
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
            // Automatic quality and format optimization for web performance
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error.Message);
            throw new InvalidOperationException($"Cloudinary upload error: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }
}

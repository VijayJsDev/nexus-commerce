using CommerceSaaS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CommerceSaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IImageUploadService _imageUploadService;
    private readonly ILogger<UploadController> _logger;

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif"
    };

    public UploadController(IImageUploadService imageUploadService, ILogger<UploadController> logger)
    {
        _imageUploadService = imageUploadService;
        _logger = logger;
    }

    /// <summary>
    /// Uploads an image file to Cloudinary and returns the hosted HTTPS CDN URL.
    /// Can be used for both product pictures and organization logos.
    /// </summary>
    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile? file, [FromQuery] string folder = "products")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No image file provided." });
        }

        // Limit maximum size to 10 MB
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(new { message = "Image file size exceeds the 10 MB limit." });
        }

        if (!AllowedMimeTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Only JPG, PNG, WEBP, and GIF images are supported." });
        }

        try
        {
            using var stream = file.OpenReadStream();
            var imageUrl = await _imageUploadService.UploadImageAsync(stream, file.FileName, folder);

            return Ok(new
            {
                success = true,
                url = imageUrl,
                fileName = file.FileName,
                folder
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image {FileName} to Cloudinary.", file.FileName);
            return StatusCode(500, new { message = "Image upload failed. Please verify Cloudinary configuration." });
        }
    }
}

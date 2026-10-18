namespace CommerceSaaS.Application.Interfaces;

public interface IImageUploadService
{
    /// <summary>
    /// Uploads an image stream to Cloudinary and returns the secure HTTPS delivery URL.
    /// </summary>
    /// <param name="fileStream">The binary stream of the image file.</param>
    /// <param name="fileName">Original or sanitized file name.</param>
    /// <param name="folder">Target Cloudinary folder (e.g. "products" or "organizations").</param>
    /// <returns>Secure HTTPS CDN URL of the uploaded image.</returns>
    Task<string> UploadImageAsync(Stream fileStream, string fileName, string folder = "products");
}

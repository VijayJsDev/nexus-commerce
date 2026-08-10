// HealthController.cs — Health check endpoint
//
// This controller exposes a simple endpoint to verify the API is running.
// It is the .NET equivalent of the Express route:
//   app.get('/health', (req, res) => res.json({ status: 'OK' }))
//
// ABOUT NAMESPACES:
// Namespaces in C# are like module paths — they organize code and prevent
// naming conflicts. Convention: <CompanyName>.<ProductName>.<Layer>.<Feature>

using Microsoft.AspNetCore.Mvc;

namespace CommerceSaaS.Api.Controllers;

// [ApiController] — Marks this class as an API controller.
//   Enables: automatic 400 responses for invalid models, binding source inference.
//
// [Route("api/[controller]")] — Sets the base route for all methods in this class.
//   [controller] is replaced with the class name minus "Controller".
//   HealthController → "health" → full route: /api/health
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    // [HttpGet] — Responds to HTTP GET requests at this controller's base route.
    //   Full route resolved: GET /api/health
    //
    // IActionResult — The return type for controller actions.
    //   It's an abstraction that lets you return different HTTP responses:
    //   Ok(), NotFound(), BadRequest(), Created(), etc.
    //   This is similar to Express's res.json(), res.status(404).json(), etc.
    [HttpGet]
    public IActionResult GetHealth()
    {
        // Ok() → HTTP 200 OK
        // The anonymous object { status = "OK" } is automatically serialized to JSON:
        // {"status":"OK"}
        return Ok(new { status = "OK" });
    }
}

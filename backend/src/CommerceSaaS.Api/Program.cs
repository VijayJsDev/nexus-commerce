// Program.cs — Application entry point for CommerceSaaS.Api
//
// This file replaces what was previously:
//   - server.ts   (starting the HTTP server)
//   - app.ts      (configuring Express middleware and routes)
//
// STRUCTURE:
//   1. Create the builder (service registration phase)
//   2. Register services into the DI container
//   3. Build the application
//   4. Configure the HTTP request pipeline (middleware order matters!)
//   5. Run the application

// ──────────────────────────────────────────────────────────────────
// SECTION 1: Builder Setup
// WebApplication.CreateBuilder(args) reads:
//   - appsettings.json
//   - appsettings.{Environment}.json (e.g., appsettings.Development.json)
//   - Environment variables (these OVERRIDE the json files)
//   - Command-line arguments
// ──────────────────────────────────────────────────────────────────
var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────────
// SECTION 2: Register Services (Dependency Injection container)
//
// Think of this as a "registry" of all the things your app can use.
// When a Controller asks for IProductRepository in its constructor,
// the DI container looks here to find out which implementation to provide.
// ──────────────────────────────────────────────────────────────────

// Adds support for attribute-based routing and controller classes.
// This is the equivalent of Express's "router" mechanism, but structured.
builder.Services.AddControllers();

// Read the allowed origins from appsettings.json "Cors:AllowedOrigins"
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

// Register CORS (Cross-Origin Resource Sharing) policy.
// This controls which frontend domains can call this API.
// "AllowFrontend" is just a name we give this policy — we reference it below.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()      // Allow any request header (e.g., Authorization, Content-Type)
              .AllowAnyMethod();     // Allow GET, POST, PUT, DELETE, PATCH, etc.
    });
});

// ──────────────────────────────────────────────────────────────────
// SECTION 3: Build the Application
// Once Build() is called, no more services can be registered.
// ──────────────────────────────────────────────────────────────────
var app = builder.Build();

// ──────────────────────────────────────────────────────────────────
// SECTION 4: Configure the HTTP Request Pipeline
//
// Middlewares execute in the ORDER they are registered here.
// A request flows TOP → BOTTOM through these middlewares.
// If a middleware doesn't call next(), the pipeline stops there.
//
// Best practice order:
//   1. Exception handling (catches errors from anything below)
//   2. HTTPS redirection
//   3. CORS (must come before authorization)
//   4. Authentication & Authorization (added later)
//   5. Routing
// ──────────────────────────────────────────────────────────────────

// Global exception handler — catches unhandled exceptions and returns
// a clean error response. We'll refine this later with a custom handler.
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            status = "Error",
            message = "An unexpected error occurred."
        });
    });
});

// Redirect HTTP → HTTPS automatically.
// In Docker/production this is handled by the reverse proxy (Nginx),
// but it's good practice to have it here too.
app.UseHttpsRedirection();

// Apply the CORS policy defined above.
// MUST come before UseAuthorization.
app.UseCors("AllowFrontend");

// Map controller classes to their routes.
// ASP.NET Core will scan for classes with [ApiController] attribute
// and register their [HttpGet], [HttpPost], etc. routes automatically.
app.MapControllers();

// ──────────────────────────────────────────────────────────────────
// SECTION 5: Run
// Starts the Kestrel web server and begins accepting requests.
// Equivalent to: app.listen(port, ...) in Express
// ──────────────────────────────────────────────────────────────────
app.Run();

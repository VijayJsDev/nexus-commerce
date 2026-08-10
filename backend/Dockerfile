# ─── Stage 1: Build ────────────────────────────────────────────────────────────
# Use the full .NET 10 SDK image to compile the application.
# The SDK image (~900MB) contains the compiler, CLI tools, and runtime.
# We only use this for building — it never ends up in the final image.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and all .csproj files first.
# This leverages Docker layer caching: if only source code changes (not dependencies),
# the "dotnet restore" layer won't re-run — making rebuilds much faster.
COPY CommerceSaaS.slnx .
COPY src/CommerceSaaS.Api/CommerceSaaS.Api.csproj                         src/CommerceSaaS.Api/
COPY src/CommerceSaaS.Application/CommerceSaaS.Application.csproj         src/CommerceSaaS.Application/
COPY src/CommerceSaaS.Domain/CommerceSaaS.Domain.csproj                   src/CommerceSaaS.Domain/
COPY src/CommerceSaaS.Infrastructure/CommerceSaaS.Infrastructure.csproj   src/CommerceSaaS.Infrastructure/
COPY tests/CommerceSaaS.UnitTests/CommerceSaaS.UnitTests.csproj           tests/CommerceSaaS.UnitTests/
COPY tests/CommerceSaaS.IntegrationTests/CommerceSaaS.IntegrationTests.csproj tests/CommerceSaaS.IntegrationTests/

# Restore NuGet packages (equivalent to npm install).
# Downloads all packages declared in .csproj files.
RUN dotnet restore CommerceSaaS.slnx

# Copy the rest of the source code
COPY . .

# Publish the API project in Release configuration.
# --no-restore: skip restore since we already did it above
# -o /app/publish: output compiled artifacts to /app/publish
RUN dotnet publish src/CommerceSaaS.Api/CommerceSaaS.Api.csproj \
    --no-restore \
    -c Release \
    -o /app/publish

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────────
# Use only the ASP.NET Core runtime image (~200MB).
# This image does NOT contain the SDK — it can only run pre-compiled apps.
# The compiled output from Stage 1 is copied here.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy only the published output from the build stage.
# The full SDK, source code, and build artifacts are LEFT BEHIND.
COPY --from=build /app/publish .

# The port ASP.NET Core listens on inside the container.
# This is configured via the ASPNETCORE_URLS environment variable.
EXPOSE 8080

# Set the environment to production inside Docker.
# Override this to "Development" in docker-compose for dev builds.
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# The entry point: run the compiled DLL.
# Equivalent to: node dist/server.js
ENTRYPOINT ["dotnet", "CommerceSaaS.Api.dll"]

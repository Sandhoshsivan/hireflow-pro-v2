# ── Stage 1: Build React Frontend ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY hireflow-ui/package*.json ./
RUN npm ci
COPY hireflow-ui/ ./
RUN npm run build

# ── Stage 2: Build .NET Backend ───────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /app
# Copy project files for layer-cached restore
COPY HireFlowPro.Api/HireFlowPro.Api.csproj HireFlowPro.Api/
COPY HireFlowPro.Core/HireFlowPro.Core.csproj HireFlowPro.Core/
COPY HireFlowPro.Infrastructure/HireFlowPro.Infrastructure.csproj HireFlowPro.Infrastructure/
RUN dotnet restore HireFlowPro.Api/HireFlowPro.Api.csproj
# Copy everything and publish
COPY . .
RUN dotnet publish HireFlowPro.Api/HireFlowPro.Api.csproj -c Release -o /publish

# ── Stage 3: Production Image ─────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=backend-build /publish .
COPY --from=frontend-build /app/frontend/dist wwwroot/

ENV ASPNETCORE_URLS=http://+:${PORT:-5000}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000
ENTRYPOINT ["dotnet", "HireFlowPro.Api.dll"]

# Aerion Development Runner
# This script initializes and runs all components of the Aerion project.

$Host.UI.RawUI.WindowTitle = "Aerion - Dev Environment"

function Show-Header {
    Clear-Host
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "             🚀 AERION DEVELOPMENT SUITE 🚀               " -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""
}

Show-Header

# 1. Dependency Validation
Write-Host "[1/5] Validating dependencies..." -ForegroundColor White

if (-not (Test-Path "node_modules")) {
    Write-Host "      -> Installing root dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "      -> Root dependencies found." -ForegroundColor Gray
}

if (-not (Test-Path "server\node_modules")) {
    Write-Host "      -> Installing server dependencies..." -ForegroundColor Yellow
    npm install --prefix server
} else {
    Write-Host "      -> Server dependencies found." -ForegroundColor Gray
}

# 2. Infrastructure Setup (Docker)
Write-Host "`n[2/5] Checking infrastructure (PostgreSQL & Redis)..." -ForegroundColor White
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "      -> Starting Docker containers..." -ForegroundColor Yellow
    docker-compose up -d --wait
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      -> Infrastructure is healthy." -ForegroundColor Green
    } else {
        Write-Host "      -> Warning: Docker containers failed to start within timeout." -ForegroundColor Red
        Write-Host "         Please ensure Docker Desktop is running." -ForegroundColor Gray
    }
} else {
    Write-Host "      -> Warning: Docker not found. Manual setup required." -ForegroundColor Red
    Write-Host "         Ensure Postgres (5432) and Redis (6379) are running locally." -ForegroundColor Gray
}

# 3. Environment Configuration
Write-Host "`n[3/5] Checking environment files..." -ForegroundColor White

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Copy-Item ".env.example" ".env"
    Write-Host "      -> Created root .env" -ForegroundColor Yellow
}

if (-not (Test-Path "server\.env") -and (Test-Path "server\.env.example")) {
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "      -> Created server .env" -ForegroundColor Yellow
}

# 4. Database Initialization
Write-Host "`n[4/5] Initializing database..." -ForegroundColor White
Write-Host "      -> Applying migrations..." -ForegroundColor Yellow
npm run db:migrate --prefix server
Write-Host "      -> Seeding initial data..." -ForegroundColor Yellow
npm run db:seed --prefix server

# 5. Launching Services
Write-Host "`n[5/5] Launching all services..." -ForegroundColor White
Write-Host "      -> Starting Vite Dev Server & Express Backend server" -ForegroundColor Green
Write-Host "      -> (Press Ctrl+C to stop all services)`n" -ForegroundColor Gray

# Run the dev:all script which uses concurrently
npm run dev:all

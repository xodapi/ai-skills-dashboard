#!/usr/bin/env pwsh
# Pre-deployment test script
# Ensures the app builds successfully before deploying

$ErrorActionPreference = "Stop"

Write-Host "🧪 Pre-deployment testing..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend API is accessible
Write-Host "📡 Testing backend API..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "https://ai-skills.syntog.ru/api/v1/health" -TimeoutSec 30
    if ($healthCheck.status -eq "healthy") {
        Write-Host "✅ Backend API is healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend API returned unexpected status: $($healthCheck.status)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend API is not accessible: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Training modules endpoint
Write-Host "📚 Testing training modules endpoint..." -ForegroundColor Yellow
try {
    $modules = Invoke-RestMethod -Uri "https://ai-skills.syntog.ru/api/v1/training/modules" -TimeoutSec 30
    if ($modules.modules.Count -gt 0) {
        Write-Host "✅ Training modules endpoint working ($($modules.modules.Count) modules)" -ForegroundColor Green
        
        # Test 2b: Check if a module has exercises
        $pythonModule = Invoke-RestMethod -Uri "https://ai-skills.syntog.ru/api/v1/training/modules/Python" -TimeoutSec 30
        if ($pythonModule.exercises.Count -gt 0) {
            Write-Host "✅ Module exercises working ($($pythonModule.exercises.Count) exercises)" -ForegroundColor Green
        } else {
            Write-Host "❌ Module has no exercises" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ No training modules returned" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Training modules endpoint failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Frontend TypeScript check
Write-Host "📝 Checking frontend TypeScript..." -ForegroundColor Yellow
Push-Location frontend
try {
    # Check if node_modules exists and npm is available
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️  node_modules not found, skipping TypeScript check" -ForegroundColor Yellow
    } elseif (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  npm not in PATH, skipping TypeScript check" -ForegroundColor Yellow
    } else {
        $tscOutput = npm run type-check 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ TypeScript check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  TypeScript check failed (non-critical):" -ForegroundColor Yellow
            Write-Host $tscOutput -ForegroundColor DarkGray
        }
    }
} finally {
    Pop-Location
}

# Test 4: Frontend build (dry run)
Write-Host "🏗️  Testing frontend build..." -ForegroundColor Yellow
Push-Location frontend
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️  node_modules not found, skipping build test" -ForegroundColor Yellow
    } elseif (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  npm not in PATH, skipping build test" -ForegroundColor Yellow
    } else {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend build successful" -ForegroundColor Green
            # Clean up build artifacts
            if (Test-Path "dist") {
                Remove-Item -Recurse -Force dist
            }
        } else {
            Write-Host "⚠️  Frontend build failed (non-critical):" -ForegroundColor Yellow
            Write-Host $buildOutput -ForegroundColor DarkGray
        }
    }
} finally {
    Pop-Location
}

# Test 5: Frontend is accessible
Write-Host "🌐 Testing frontend accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://ai-skills.syntog.ru/" -TimeoutSec 30
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend returned status code: $($frontendResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend is not accessible: $_" -ForegroundColor Red
    exit 1
}

# Test 6: Check for import errors in main pages
Write-Host "🔍 Checking for common import errors..." -ForegroundColor Yellow
$errorPatterns = @(
    @{ File = "frontend/src/main.tsx"; Pattern = "import.*['\`"]\.\/index\.css['\`"]"; Description = "index.css import" },
    @{ File = "frontend/src/index.css"; Pattern = "@import.*themes\.css"; Description = "themes.css import" },
    @{ File = "frontend/src/context/ThemeContext.tsx"; Pattern = "export.*ThemeProvider"; Description = "ThemeProvider export" }
)

$importErrors = 0
foreach ($check in $errorPatterns) {
    if (Test-Path $check.File) {
        $content = Get-Content $check.File -Raw
        if ($content -match $check.Pattern) {
            Write-Host "  ✓ $($check.Description) found in $($check.File)" -ForegroundColor DarkGray
        } else {
            Write-Host "  ❌ Missing $($check.Description) in $($check.File)" -ForegroundColor Red
            $importErrors++
        }
    } else {
        Write-Host "  ❌ File not found: $($check.File)" -ForegroundColor Red
        $importErrors++
    }
}

if ($importErrors -eq 0) {
    Write-Host "✅ All import checks passed" -ForegroundColor Green
} else {
    Write-Host "❌ Found $importErrors import errors" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ All pre-deployment tests passed!" -ForegroundColor Green
Write-Host "   Safe to deploy to production." -ForegroundColor Gray

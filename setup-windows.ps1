# Windows Setup Script for Web Technology Reconnaissance Tool
# Run this script in PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Web Technology - Windows Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# 1. Check Node.js installation
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check pnpm installation
Write-Host "[2/5] Checking pnpm installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm is installed: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pnpm is not installed. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✓ pnpm installed successfully" -ForegroundColor Green
}

# 3. Install ffuf
Write-Host "[3/5] Installing ffuf (Directory Fuzzer)..." -ForegroundColor Yellow
$ffufDir = "$env:USERPROFILE\ffuf"
$ffufZip = "$env:TEMP\ffuf.zip"

if (Test-Path "$ffufDir\ffuf.exe") {
    Write-Host "✓ ffuf is already installed" -ForegroundColor Green
} else {
    try {
        Write-Host "Downloading ffuf v2.1.0..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri "https://github.com/ffuf/ffuf/releases/download/v2.1.0/ffuf_2.1.0_windows_amd64.zip" -OutFile $ffufZip
        
        Write-Host "Extracting ffuf..." -ForegroundColor Cyan
        Expand-Archive -Path $ffufZip -DestinationPath $ffufDir -Force
        
        # Add to PATH
        $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
        if ($currentPath -notlike "*$ffufDir*") {
            [Environment]::SetEnvironmentVariable('Path', "$currentPath;$ffufDir", 'User')
            Write-Host "✓ ffuf installed and added to PATH" -ForegroundColor Green
            Write-Host "  Note: You may need to restart PowerShell for PATH changes to take effect" -ForegroundColor Yellow
        } else {
            Write-Host "✓ ffuf installed successfully" -ForegroundColor Green
        }
        
        # Cleanup
        Remove-Item $ffufZip -Force
    } catch {
        Write-Host "✗ Failed to install ffuf: $_" -ForegroundColor Red
        Write-Host "You can manually download from: https://github.com/ffuf/ffuf/releases" -ForegroundColor Yellow
    }
}

# 4. Clone SecLists
Write-Host "[4/5] Installing SecLists wordlists..." -ForegroundColor Yellow
$secListsDir = "$env:USERPROFILE\SecLists"

if (Test-Path $secListsDir) {
    Write-Host "✓ SecLists is already installed" -ForegroundColor Green
} else {
    try {
        Write-Host "Cloning SecLists repository (this may take a few minutes)..." -ForegroundColor Cyan
        git clone --depth 1 https://github.com/danielmiessler/SecLists.git $secListsDir
        Write-Host "✓ SecLists installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to clone SecLists: $_" -ForegroundColor Red
        Write-Host "You can manually clone from: https://github.com/danielmiessler/SecLists" -ForegroundColor Yellow
    }
}

# 5. Install project dependencies
Write-Host "[5/5] Installing project dependencies..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your database connection in .env file" -ForegroundColor White
Write-Host "2. Run 'pnpm db:push' to setup the database" -ForegroundColor White
Write-Host "3. (Optional) Add your API keys in .env:" -ForegroundColor White
Write-Host "   - SHODAN_API_KEY" -ForegroundColor Gray
Write-Host "   - SECURITYTRAILS_API_KEY" -ForegroundColor Gray
Write-Host "4. Run 'pnpm dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "Installed tools:" -ForegroundColor Yellow
Write-Host "  ✓ ffuf: $ffufDir\ffuf.exe" -ForegroundColor Green
Write-Host "  ✓ SecLists: $secListsDir" -ForegroundColor Green
Write-Host ""
Write-Host "Happy hacking! 🚀" -ForegroundColor Cyan

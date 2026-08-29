Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
# .\start.ps1
# docker compose down
# docker compose up -d
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $projectRoot 'frontend'
$backendPath = Join-Path $projectRoot 'php-backend'
$mysqlContainer = 'matkinhDb'
$backendUrl = 'http://localhost:8000'
$frontendUrl = 'http://localhost:5173'

function Assert-Command($name) {
	if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
		throw "Khong tim thay '$name'. Hay cai dat va them vao PATH truoc khi chay script."
	}
}

Assert-Command 'docker'
Assert-Command 'php'
Assert-Command 'npm'

$savedErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
docker info 2>$null
$dockerInfoExitCode = $LASTEXITCODE
$ErrorActionPreference = $savedErrorActionPreference
if ($dockerInfoExitCode -ne 0) {
	throw 'Docker Desktop chua chay hoac Docker daemon khong san sang.'
}

Write-Host 'Dang khoi dong MySQL bang Docker Compose...' -ForegroundColor Cyan
Push-Location $projectRoot
try {
	$ErrorActionPreference = 'Continue'
	docker compose up -d mysql 2>$null
	$composeExitCode = $LASTEXITCODE
	$ErrorActionPreference = $savedErrorActionPreference
	if ($composeExitCode -ne 0) {
		throw 'Khong the khoi dong service MySQL.'
	}
} finally {
	$ErrorActionPreference = $savedErrorActionPreference
	Pop-Location
}

Write-Host 'Dang cho MySQL san sang...' -ForegroundColor Yellow
$ready = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
	$ErrorActionPreference = 'Continue'
	docker exec $mysqlContainer mysqladmin ping -h localhost -u root -proot123456 2>$null
	$pingExitCode = $LASTEXITCODE
	$ErrorActionPreference = $savedErrorActionPreference
	if ($pingExitCode -eq 0) {
		$ready = $true
		break
	}

	$running = docker inspect --format '{{.State.Running}}' $mysqlContainer 2>$null
	if ($running -ne 'true') {
		throw "Container '$mysqlContainer' da dung."
	}

	Start-Sleep -Seconds 2
}

if (-not $ready) {
	throw "MySQL chua san sang sau 60 giay. Kiem tra: docker logs $mysqlContainer"
}

Write-Host 'MySQL da san sang.' -ForegroundColor Green

$phpArguments = "-NoExit -Command Set-Location '$backendPath'; php -S localhost:8000 -t ."
$frontendArguments = "-NoExit -Command Set-Location '$frontendPath'; npm run dev"

Start-Process powershell.exe -ArgumentList $phpArguments -WorkingDirectory $backendPath
Start-Process powershell.exe -ArgumentList $frontendArguments -WorkingDirectory $frontendPath

Write-Host "Backend:  $backendUrl" -ForegroundColor Green
Write-Host "Frontend: $frontendUrl" -ForegroundColor Green

param(
    [string]$PublishedDirectory
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

$configPath = Join-Path $repositoryRoot "_config.yml"
if (-not (Test-Path $configPath)) {
    $failures.Add("_config.yml is missing.")
} else {
    $config = [IO.File]::ReadAllText($configPath)
    if ($config -notmatch '(?m)^\s*-\s+legacy-site/\s*$') {
        $failures.Add("_config.yml does not exclude legacy-site/.")
    }
}

if (Test-Path (Join-Path $repositoryRoot ".nojekyll")) {
    $failures.Add(".nojekyll is present. A branch-based static publication could bypass the Jekyll exclusion and expose legacy-site/.")
}

$workflowDirectory = Join-Path $repositoryRoot ".github/workflows"
if (Test-Path $workflowDirectory) {
    $workflows = Get-ChildItem (Join-Path $workflowDirectory "*") -File |
        Where-Object { $_.Extension -in ".yml", ".yaml" }
    foreach ($workflow in $workflows) {
        $text = [IO.File]::ReadAllText($workflow.FullName)
        if ($text -match 'actions/upload-pages-artifact' -and $text -match '(?m)^\s*path:\s*[."'' ]+\s*$') {
            $failures.Add("$($workflow.Name) appears to upload the repository root. That can expose legacy-site/.")
        }
    }
} else {
    $warnings.Add("No Pages workflow is present. Confirm in GitHub Settings > Pages that publication uses Jekyll from the intended branch and folder.")
}

if ($PublishedDirectory) {
    $resolvedPublishedDirectory = Resolve-Path $PublishedDirectory -ErrorAction Stop
    $publishedLegacy = Join-Path $resolvedPublishedDirectory "legacy-site"
    if (Test-Path $publishedLegacy) {
        $failures.Add("The published artifact contains legacy-site/.")
    }

    $publishedPhp = Get-ChildItem $resolvedPublishedDirectory -Recurse -Filter *.php -File -ErrorAction SilentlyContinue
    if ($publishedPhp.Count -gt 0) {
        $failures.Add("The published artifact contains $($publishedPhp.Count) PHP file(s). GitHub Pages would serve PHP as source text.")
    }
} else {
    $warnings.Add("No -PublishedDirectory was supplied, so the actual built artifact was not inspected.")
}

if ($failures.Count -gt 0) {
    Write-Host "FAIL: legacy publication safety check" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    $warnings | ForEach-Object { Write-Host "  - WARNING: $_" -ForegroundColor Yellow }
    exit 1
}

Write-Host "PASS: repository configuration excludes legacy-site/ and does not contain .nojekyll." -ForegroundColor Green
$warnings | ForEach-Object { Write-Host "  - WARNING: $_" -ForegroundColor Yellow }
Write-Host "For final verification, download or build the exact Pages artifact and rerun:"
Write-Host "  powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/Test-LegacyPublication.ps1 -PublishedDirectory <artifact-directory>"

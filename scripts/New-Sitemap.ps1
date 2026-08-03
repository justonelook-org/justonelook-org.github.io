param(
    [string]$BaseUrl = "https://justonelook.org",
    [string]$OutputPath = "sitemap.xml"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$normalizedBaseUrl = $BaseUrl.TrimEnd("/")
$resolvedOutput = Join-Path $repositoryRoot $OutputPath

if ($normalizedBaseUrl -notmatch '^https://[^/]+$') {
    throw "BaseUrl must be an HTTPS origin without a path, for example https://justonelook.org"
}

$pages = Get-ChildItem $repositoryRoot -Recurse -Filter *.html -File |
    Where-Object {
        $_.FullName -notmatch '[\\/](legacy-site|tmp|\.git)[\\/]' -and
        $_.Name -ne "404.html" -and
        $_.Name -ne "newsletter.html"
    }

$locations = foreach ($page in $pages) {
    $html = [IO.File]::ReadAllText($page.FullName)
    if ($html -match '<meta\s+name=["'']robots["''][^>]*content=["''][^"'']*noindex') {
        continue
    }

    $relative = $page.FullName.Substring($repositoryRoot.Length).TrimStart("\", "/").Replace("\", "/")
    if ($relative -eq "index.html") {
        $route = "/"
    } elseif ($relative.EndsWith("/index.html")) {
        $route = "/" + $relative.Substring(0, $relative.Length - "index.html".Length)
    } else {
        $route = "/" + $relative
    }

    $normalizedBaseUrl + $route
}

$xml = [System.Collections.Generic.List[string]]::new()
$xml.Add('<?xml version="1.0" encoding="UTF-8"?>')
$xml.Add('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
foreach ($location in ($locations | Sort-Object -Unique)) {
    $escaped = [System.Security.SecurityElement]::Escape($location)
    $xml.Add("  <url><loc>$escaped</loc></url>")
}
$xml.Add('</urlset>')
$xml.Add('')

[IO.File]::WriteAllText($resolvedOutput, ($xml -join [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
Write-Host "Sitemap written to $resolvedOutput with $($locations.Count) URLs using $normalizedBaseUrl"

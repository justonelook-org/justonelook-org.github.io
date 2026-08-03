param(
    [string]$BaseUrl = "https://justonelook.org",
    [string]$ShareImagePath = "/assets/brand/jol-logo.jpg"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$normalizedBaseUrl = $BaseUrl.TrimEnd("/")
$beginMarker = "<!-- BEGIN GENERATED SITE METADATA -->"
$endMarker = "<!-- END GENERATED SITE METADATA -->"

if ($normalizedBaseUrl -notmatch '^https://[^/]+$') {
    throw "BaseUrl must be an HTTPS origin without a path, for example https://justonelook.org"
}
if (-not $ShareImagePath.StartsWith("/")) {
    throw "ShareImagePath must start with /"
}

$pages = Get-ChildItem $repositoryRoot -Recurse -Filter *.html -File |
    Where-Object { $_.FullName -notmatch '[\\/](legacy-site|tmp|\.git)[\\/]' }

$updated = 0
foreach ($page in $pages) {
    $html = [IO.File]::ReadAllText($page.FullName)
    $relative = $page.FullName.Substring($repositoryRoot.Length).TrimStart("\", "/").Replace("\", "/")

    if ($relative -eq "index.html") {
        $route = "/"
    } elseif ($relative.EndsWith("/index.html")) {
        $route = "/" + $relative.Substring(0, $relative.Length - "index.html".Length)
    } else {
        $route = "/" + $relative
    }

    if ($page.Name -eq "404.html") {
        if ($html -notmatch '<meta\s+name=["'']robots["''][^>]*noindex') {
            $html = $html -replace '(?i)</head>', "  <meta name=`"robots`" content=`"noindex, follow`">`r`n</head>"
            [IO.File]::WriteAllText($page.FullName, $html, [Text.UTF8Encoding]::new($false))
            $updated++
        }
        continue
    }

    $canonical = $normalizedBaseUrl + $route
    $metadata = @"
$beginMarker
  <link rel="canonical" href="$canonical">
  <meta property="og:url" content="$canonical">
  <meta property="og:site_name" content="Just One Look">
  <meta property="og:image" content="$normalizedBaseUrl$ShareImagePath">
  <meta property="og:image:alt" content="Just One Look">
  <meta name="twitter:card" content="summary">
$endMarker
"@

    $blockPattern = "(?s)\s*" + [regex]::Escape($beginMarker) + ".*?" + [regex]::Escape($endMarker)
    if ($html -match [regex]::Escape($beginMarker)) {
        $newHtml = [regex]::Replace($html, $blockPattern, "`r`n$metadata")
    } else {
        $newHtml = $html -replace '(?i)</head>', "$metadata`r`n</head>"
    }

    if ($newHtml -ne $html) {
        [IO.File]::WriteAllText($page.FullName, $newHtml, [Text.UTF8Encoding]::new($false))
        $updated++
    }
}

Write-Host "Updated generated metadata in $updated page(s) using $normalizedBaseUrl"

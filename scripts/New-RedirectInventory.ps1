param(
    [string]$OutputPath = "launch/redirect-inventory.csv"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$legacyNatural = Join-Path $repositoryRoot "legacy-site/natural"
$blogRoot = Join-Path $repositoryRoot "library/blog/posts"
$podcastRoot = Join-Path $repositoryRoot "library/podcasts/episodes"
$resolvedOutput = Join-Path $repositoryRoot $OutputPath

$rows = [System.Collections.Generic.List[object]]::new()

function Add-Redirect {
    param(
        [string]$Source,
        [string]$Destination,
        [ValidateSet("ready", "review", "no-target")]
        [string]$Status,
        [ValidateSet("critical", "high", "normal")]
        [string]$Priority,
        [string]$Reason
    )

    $rows.Add([pscustomobject]@{
        source      = $Source
        destination = $Destination
        status      = $Status
        priority    = $Priority
        reason      = $Reason
    })
}

# Stable top-level routes.
Add-Redirect "/" "/" "ready" "critical" "Canonical home route"
Add-Redirect "/index.php" "/" "ready" "critical" "Legacy home entry point"
Add-Redirect "/index.html" "/" "ready" "critical" "Legacy home entry point"
Add-Redirect "/about.php" "/about.html" "ready" "high" "Direct replacement"
Add-Redirect "/contact.php" "/contact.html" "ready" "high" "Direct replacement"
Add-Redirect "/books.php" "/library/ebooks/" "ready" "high" "Books moved to Library"
Add-Redirect "/articles.php" "/library/articles/" "ready" "high" "Articles moved to Library"
Add-Redirect "/videos.php" "/library/videos/" "ready" "high" "Videos moved to Library"
Add-Redirect "/natural/" "/library.html" "ready" "critical" "Old combined Blog and Podcast landing page"
Add-Redirect "/natural/category/blog/" "/library/blog/" "ready" "high" "Blog category replacement"
Add-Redirect "/natural/category/podcast/" "/library/podcasts/" "ready" "high" "Podcast category replacement"
Add-Redirect "/jolnews.php" "/newsletter.html" "review" "high" "New newsletter page is still a placeholder"
Add-Redirect "/privacy.php" "/legal.html#privacy" "ready" "critical" "Privacy section on consolidated Legal page"
Add-Redirect "/terms.php" "/legal.html#terms" "ready" "critical" "Terms section on consolidated Legal page"
Add-Redirect "/copyright.php" "/legal.html#copyright" "ready" "critical" "Copyright section on consolidated Legal page"
Add-Redirect "/site-map.php" "/sitemap.xml" "ready" "high" "XML sitemap replacement"
Add-Redirect "/forum/" "https://forum.justonelook.org/" "review" "high" "Confirm whether historical forum paths need preservation"
Add-Redirect "/forum/index.php" "https://forum.justonelook.org/" "review" "high" "Confirm whether historical forum paths need preservation"

$blogSlugs = @{}
Get-ChildItem $blogRoot -Directory | ForEach-Object {
    $blogSlugs[$_.Name] = "/library/blog/posts/$($_.Name)/"
}

$episodeDestinations = @{}
Get-ChildItem $podcastRoot -Directory | ForEach-Object {
    $indexPath = Join-Path $_.FullName "index.html"
    $html = [IO.File]::ReadAllText($indexPath)
    $match = [regex]::Match($html, '<span class="number">Episode\s+(\d+)</span>')
    if (-not $match.Success) {
        throw "Could not find an episode number in $indexPath"
    }
    $episodeDestinations[[int]$match.Groups[1].Value] = "/library/podcasts/episodes/$($_.Name)/"
}

$datedPosts = Get-ChildItem $legacyNatural -Recurse -Filter index.html -File |
    Where-Object {
        $_.FullName -match '[\\/]natural[\\/](20\d{2})[\\/](\d{2})[\\/]([^\\/]+)[\\/]index\.html$'
    }

foreach ($post in $datedPosts) {
    $null = $post.FullName -match '[\\/]natural[\\/](20\d{2})[\\/](\d{2})[\\/]([^\\/]+)[\\/]index\.html$'
    $year = $Matches[1]
    $month = $Matches[2]
    $slug = $Matches[3]
    $source = "/natural/$year/$month/$slug/"

    $podcastMatch = [regex]::Match($slug, '^podcast-(?:episode|ep)-(\d+)-')
    if ($podcastMatch.Success) {
        $episodeNumber = [int]$podcastMatch.Groups[1].Value
        if ($episodeDestinations.ContainsKey($episodeNumber)) {
            Add-Redirect $source $episodeDestinations[$episodeNumber] "ready" "high" "Matched by podcast episode number"
        } else {
            Add-Redirect $source "" "no-target" "high" "No new page found for podcast episode $episodeNumber"
        }
        continue
    }

    if ($slug -eq "68") {
        Add-Redirect $source "/library/blog/posts/the-power-of-attention/" "ready" "high" "Verified numeric legacy slug by page title and date"
    } elseif ($slug -eq "mind-matters" -and $year -eq "2017" -and $month -eq "01") {
        Add-Redirect $source "/library/podcasts/episodes/mind-matters/" "ready" "high" "Verified legacy Episode 15 title and date"
    } elseif ($blogSlugs.ContainsKey($slug)) {
        Add-Redirect $source $blogSlugs[$slug] "ready" "high" "Matched by blog slug"
    } else {
        Add-Redirect $source "" "no-target" "high" "No matching new blog post"
    }
}

$outputDirectory = Split-Path -Parent $resolvedOutput
if (-not (Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$rows |
    Sort-Object @{ Expression = { switch ($_.priority) { "critical" { 0 } "high" { 1 } default { 2 } } } }, source |
    Export-Csv -Path $resolvedOutput -NoTypeInformation -Encoding utf8

$summary = $rows | Group-Object status | Sort-Object Name
Write-Host "Redirect inventory written to $resolvedOutput"
$summary | ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Name, $_.Count) }

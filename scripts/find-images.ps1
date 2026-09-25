# Resolves real Wikimedia Commons filenames for key Tamil heritage subjects.
$pairs = @(
    @('marina', 'Marina Beach Chennai'),
    @('srirangam', 'Ranganathaswamy Temple Srirangam'),
    @('chidambaram', 'Nataraja Temple Chidambaram'),
    @('kanyakumari', 'Kanyakumari Sunrise'),
    @('sangam', 'Tamil Sangam'),
    @('vel', 'Murugan vel')
)
foreach ($p in $pairs) {
    $slug = $p[0]; $term = $p[1]
    $u = "https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=" + [uri]::EscapeDataString($term) + "&srnamespace=6&srlimit=3&format=json"
    try {
        $r = Invoke-RestMethod -Uri $u -TimeoutSec 20
        if ($r.query.search.Count -gt 0) {
            $title = $r.query.search[0].title -replace '^File:', ''
            Write-Output ("{0}|{1}" -f $slug, $title)
        } else {
            Write-Output ("{0}|NONE" -f $slug)
        }
    } catch {
        Write-Output ("{0}|ERROR" -f $slug)
    }
    Start-Sleep -Milliseconds 3000
}

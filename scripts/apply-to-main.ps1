param(
    [string]$Target = 'C:\Users\kerem\Desktop\good_tracker'
)

$ErrorActionPreference = 'Stop'
$source = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$targetPath = (Resolve-Path -LiteralPath $Target).Path
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
$git = if ($gitCommand) { $gitCommand.Source } else { 'C:\Program Files\Git\cmd\git.exe' }
if (-not (Test-Path -LiteralPath $git)) { throw 'Git was not found.' }

function Invoke-Git {
    param([string]$Directory, [string[]]$Arguments)
    $result = & $git -C $Directory @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git failed: $($Arguments -join ' ')"
    }
    return $result
}

$repoRoot = Invoke-Git $targetPath @('rev-parse', '--show-toplevel')
if ([IO.Path]::GetFullPath($repoRoot) -ne [IO.Path]::GetFullPath($targetPath)) {
    throw 'Target must be the repository root.'
}
if (Invoke-Git $targetPath @('status', '--porcelain')) {
    throw 'Save or commit the local changes in the target repository first.'
}
$branch = Invoke-Git $targetPath @('branch', '--show-current')
if ($branch -ne 'main') {
    throw 'Switch the target repository to main first.'
}

$bundle = Join-Path ([IO.Path]::GetTempPath()) ('goodtracker-' + [guid]::NewGuid().ToString('N') + '.bundle')
Invoke-Git $source @('bundle', 'create', $bundle, 'midterm-main', '^156bbdd')
Invoke-Git $targetPath @('fetch', '--no-tags', $bundle, 'midterm-main')
$incoming = Invoke-Git $targetPath @('rev-parse', 'FETCH_HEAD')
$current = Invoke-Git $targetPath @('rev-parse', 'HEAD')
& $git -C $targetPath merge-base --is-ancestor $current $incoming
if ($LASTEXITCODE -ne 0) {
    throw 'Main has other commits. Stopped without changing its files.'
}

Invoke-Git $targetPath @('merge', '--ff-only', $incoming)
Write-Host 'Midterm changes applied to main. Nothing was pushed to GitHub.'

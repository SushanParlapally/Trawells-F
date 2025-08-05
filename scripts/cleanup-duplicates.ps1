# Duplicate File Cleanup Script
# This script prevents and removes duplicate .js files that have corresponding .tsx files

param(
    [switch]$PreventOnly,
    [switch]$CleanupOnly,
    [switch]$Verbose
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
$srcPath = Join-Path $projectRoot "src"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Find-DuplicateJsFiles {
    $duplicates = @()
    
    Get-ChildItem -Path $srcPath -Recurse -Include "*.js" | ForEach-Object {
        $tsxPath = $_.FullName -replace "\.js$", ".tsx"
        if (Test-Path $tsxPath) {
            $duplicates += $_
        }
    }
    
    return $duplicates
}

function Remove-DuplicateFiles {
    param([array]$Files)
    
    $removedCount = 0
    foreach ($file in $Files) {
        try {
            Remove-Item $file.FullName -Force
            $removedCount++
            if ($Verbose) {
                Write-Log "Removed duplicate file: $($file.Name)" "REMOVE"
            }
        }
        catch {
            Write-Log "Failed to remove $($file.Name): $($_.Exception.Message)" "ERROR"
        }
    }
    
    return $removedCount
}

function Add-GitHook {
    $hookPath = Join-Path -Path $projectRoot -ChildPath ".git" | Join-Path -ChildPath "hooks" | Join-Path -ChildPath "pre-commit"
    $hookContent = @"
#!/bin/sh
# Pre-commit hook to prevent duplicate .js files

# Check for duplicate .js files
duplicates=`$(find src -name "*.js" | while read file; do
    tsx_file=`${file%.js}.tsx
    if [ -f "`$tsx_file" ]; then
        echo "`$file"
    fi
done)

if [ ! -z "`$duplicates" ]; then
    echo "Error: Found duplicate .js files with corresponding .tsx files:"
    echo "`$duplicates"
    echo "Please remove these duplicate files before committing."
    exit 1
fi
"@

    if (!(Test-Path $hookPath)) {
        $hookContent | Out-File -FilePath $hookPath -Encoding UTF8
        Write-Log "Created pre-commit hook to prevent duplicates" "HOOK"
    }
}

function Add-VSCodeSettings {
    $settingsPath = Join-Path -Path $projectRoot -ChildPath ".vscode" | Join-Path -ChildPath "settings.json"
    
    $vscodeDir = Split-Path $settingsPath -Parent
    if (!(Test-Path $vscodeDir)) {
        New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
    }
    
    $settings = @{
        "files.exclude" = @{
            "**/*.js" = "when:$(if (Test-Path "**/*.tsx") { "true" } else { "false" })"
        }
        "typescript.preferences.includePackageJsonAutoImports" = "auto"
        "typescript.suggest.autoImports" = $true
    }
    
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
    Write-Log "Updated VSCode settings to hide duplicate .js files" "SETTINGS"
}

# Main execution
Write-Log "Starting duplicate file cleanup script" "START"

if ($CleanupOnly -or (!$PreventOnly)) {
    $duplicates = Find-DuplicateJsFiles
    
    if ($duplicates.Count -gt 0) {
        Write-Log "Found $($duplicates.Count) duplicate .js files" "INFO"
        
        if ($Verbose) {
            $duplicates | ForEach-Object { Write-Log "Duplicate: $($_.Name)" "DUPLICATE" }
        }
        
        $removedCount = Remove-DuplicateFiles -Files $duplicates
        Write-Log "Removed $removedCount duplicate files" "SUCCESS"
    } else {
        Write-Log "No duplicate files found" "INFO"
    }
}

if ($PreventOnly -or (!$CleanupOnly)) {
    Add-GitHook
    Add-VSCodeSettings
    Write-Log "Prevention measures added" "SUCCESS"
}

Write-Log "Script completed successfully" "COMPLETE" 
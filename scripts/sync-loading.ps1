param(
    [string]$Root = "src\pages\Manager"
)

$files = Get-ChildItem -Path $Root -Recurse -Filter "*.tsx"

$replacements = @(
    # Pattern 1: inline "rounded-lg border bg-white p-6" loading div
    @{
        From = '<div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t\("common\.loading"\)}<\/div>'
        To   = '<div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50"><Spinner size="md" showText text={t("common.loading")} /></div>'
    },
    # Pattern 2: inline p-12 text-center loading
    @{
        From = '<div className="p-12 text-center text-sm text-slate-500">{t\("common\.loading"\)}<\/div>'
        To   = '<div className="flex min-h-[300px] items-center justify-center"><Spinner size="lg" showText text={t("common.loading")} /></div>'
    },
    # Pattern 3: py-16 loading
    @{
        From = '<div className="flex items-center justify-center py-16 text-sm text-slate-500">{t\("common\.loading"\)}<\/div>'
        To   = '<div className="flex min-h-[200px] items-center justify-center"><Spinner size="lg" showText text={t("common.loading")} /></div>'
    },
    # Pattern 4: p-8 loading
    @{
        From = '<div className="flex items-center justify-center p-8">{t\("common\.loading"\)}<\/div>'
        To   = '<div className="flex min-h-[150px] items-center justify-center"><Spinner size="md" showText text={t("common.loading")} /></div>'
    },
    # Pattern 5: h-80 chart loading
    @{
        From = '<div className="flex h-80 items-center justify-center">{t\("common\.loading"\)}<\/div>'
        To   = '<div className="flex h-80 items-center justify-center"><Spinner size="lg" showText text={t("common.loading")} /></div>'
    },
    # Pattern 6: LoadingCommet usage
    @{
        From = '<LoadingCommet color="#FFFFFF" size="medium" />'
        To   = '<LoadingScreen text={t("common.processing")} />'
    },
    @{
        From = '<LoadingCommet />'
        To   = '<LoadingScreen text={t("common.processing")} />'
    },
    # Pattern 7: LoadingAtom usage
    @{
        From = '<LoadingAtom />'
        To   = '<LoadingScreen text={t("common.loading")} />'
    }
)

$stats = @{ Changed = 0; Skipped = 0 }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    $changed = $false

    foreach ($r in $replacements) {
        if ($content -match [regex]::Escape($r.From) -or $content -match $r.From) {
            $newContent = $content -replace $r.From, $r.To
            if ($newContent -ne $content) {
                $content = $newContent
                $changed = $true
            }
        }
    }

    if ($changed) {
        # Add Spinner import if missing
        if ($content -match "Spinner" -and $content -notmatch 'import.*Spinner.*from') {
            $content = $content -replace '(import .+ from "react-i18next";)', '$1' + [Environment]::NewLine + 'import { Spinner } from "@/components/ui/spinner";'
        }
        # Add LoadingScreen import if missing
        if ($content -match "LoadingScreen" -and $content -notmatch 'import.*LoadingScreen.*from') {
            $content = $content -replace '(import .+ from "react-i18next";)', '$1' + [Environment]::NewLine + 'import { LoadingScreen } from "@/components/ui/loading-screen";'
        }
        # Remove old loading imports
        $content = $content -replace 'import \{ LoadingCommet \} from "@/components/ui/loading";' + [Environment]::NewLine, ''
        $content = $content -replace 'import \{ LoadingAtom \} from "@/components/ui/loading";' + [Environment]::NewLine, ''
        $content = $content -replace 'import \{ LoadingCommet \} from "@/components/ui/loading";', ''
        $content = $content -replace 'import \{ LoadingAtom \} from "@/components/ui/loading";', ''

        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "CHANGED: $($file.FullName)"
        $stats.Changed++
    } else {
        $stats.Skipped++
    }
}

Write-Host "`n=== Summary ===`nChanged: $($stats.Changed)`nSkipped: $($stats.Skipped)"

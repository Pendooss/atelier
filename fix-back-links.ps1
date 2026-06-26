# Запусти из корня папки ATELIER:
# .\fix-back-links.ps1

$pages = @(
  "app\results\shops\page.tsx",
  "app\results\brands\page.tsx",
  "app\results\wardrobe-personal\page.tsx",
  "app\results\outfits\page.tsx",
  "app\results\chat\page.tsx"
)

foreach ($page in $pages) {
  if (Test-Path $page) {
    $content = Get-Content $page -Raw -Encoding UTF8
    $content = $content -replace 'href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground', 'href="/?step=3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
    $content = $content -replace 'href="/" className="mt-4 inline-block text-accent underline">На главную', 'href="/?step=3" className="mt-4 inline-block text-accent underline">К результатам'
    $content = $content -replace 'href="/" className="mt-4 inline-block text-accent underline">Вернуться на главную', 'href="/?step=3" className="mt-4 inline-block text-accent underline">К результатам'
    Set-Content $page $content -Encoding UTF8
    Write-Host "OK: $page" -ForegroundColor Green
  } else {
    Write-Host "НЕ НАЙДЕН: $page" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Готово! Перезапусти: npm run dev" -ForegroundColor Cyan

#!/bin/bash
# Запусти этот скрипт из корня папки ATELIER
# Он заменит все ссылки "Назад" на /?step=3 во всех страницах платных услуг

PAGES=(
  "app/results/shops/page.tsx"
  "app/results/brands/page.tsx"
  "app/results/wardrobe-personal/page.tsx"
  "app/results/outfits/page.tsx"
  "app/results/chat/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    # Заменяем href="/" на href="/?step=3" в ссылках назад
    sed -i 's|href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground|href="/?step=3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground|g' "$page"
    # Заменяем ссылки "На главную" на "К результатам"
    sed -i 's|href="/" className="mt-4 inline-block text-accent underline">На главную|href="/?step=3" className="mt-4 inline-block text-accent underline">К результатам|g' "$page"
    echo "✅ Исправлен: $page"
  else
    echo "❌ Не найден: $page"
  fi
done

echo ""
echo "Готово! Перезапусти сервер: npm run dev"

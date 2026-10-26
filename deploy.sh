#!/usr/bin/env bash
# Сборка статики для GitHub Pages.
# Использование: ./deploy.sh <имя-репозитория>
# Результат — каталог docs/ с прописанным <base href="/<repo>/"> (GitHub Pages: main /docs).
set -euo pipefail

REPO="${1:?укажите имя репозитория: ./deploy.sh garden-store}"
BASE="/${REPO}/"
HERE="$(cd "$(dirname "$0")" && pwd)"
DIST="$HERE/docs"

rm -rf "$DIST"
mkdir -p "$DIST"
cp -r "$HERE/index.html" "$HERE/404.html" "$HERE/css" "$HERE/js" "$HERE/assets" "$DIST/"

# <base href> — чтобы ссылки и модули работали из подкаталога
python3 - "$DIST/index.html" "$BASE" <<'PY'
import sys
path, base = sys.argv[1], sys.argv[2]
html = open(path, encoding='utf-8').read()
html = html.replace('<base href="/" />', f'<base href="{base}" />', 1)
open(path, 'w', encoding='utf-8').write(html)
PY

# 404.html возвращает на index.html внутри подкаталога
python3 - "$DIST/404.html" "$BASE" <<'PY'
import sys
path, base = sys.argv[1], sys.argv[2]
html = open(path, encoding='utf-8').read().replace('__BASE__', base)
open(path, 'w', encoding='utf-8').write(html)
PY

touch "$DIST/.nojekyll"
echo "Готово: $DIST (base $BASE)"

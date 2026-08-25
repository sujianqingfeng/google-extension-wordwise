#!/usr/bin/env bash
# 构建并提交 wordwise 到 Chrome Web Store 审核
#
# 首次使用前: 先运行 ./scripts/cws-auth.sh 获取凭据（会写入 .env）
#
# 用法:
#   ./scripts/publish.sh              # 构建 + 上传 + 提交审核
#   ./scripts/publish.sh --dry-run    # 只验证凭据，不上传
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ] || ! grep -q "^CWS_REFRESH_TOKEN=." .env; then
	echo "❌ .env 中没有 CWS 凭据，先运行: ./scripts/cws-auth.sh <CLIENT_ID> <CLIENT_SECRET>"
	exit 1
fi

# 读取 .env 里的 CWS_ 变量
set -a
# shellcheck disable=SC1091
source .env
set +a

: "${CWS_CLIENT_ID:?缺少 CWS_CLIENT_ID}"
: "${CWS_CLIENT_SECRET:?缺少 CWS_CLIENT_SECRET}"
: "${CWS_REFRESH_TOKEN:?缺少 CWS_REFRESH_TOKEN}"

# 由 manifest key 推导的固定扩展 ID
CWS_EXTENSION_ID="ekijnogcdbbfidacoidoilpjinkokiij"
export CWS_EXTENSION_ID

VERSION=$(node -p "require('./package.json').version")

echo "==> 构建 v${VERSION}"
npm run build >/dev/null
npm run pack >/dev/null

ZIP="web-ext-artifacts/wordwise-${VERSION}.zip"
if [ ! -f "$ZIP" ]; then
	echo "❌ 没找到 ${ZIP}"
	exit 1
fi
echo "==> 上传 ${ZIP}"

npx wxt submit \
	--chrome-zip "$ZIP" \
	--chrome-extension-id "$CWS_EXTENSION_ID" \
	--chrome-client-id "$CWS_CLIENT_ID" \
	--chrome-client-secret "$CWS_CLIENT_SECRET" \
	--chrome-refresh-token "$CWS_REFRESH_TOKEN" \
	"$@"

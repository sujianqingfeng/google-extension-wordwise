#!/usr/bin/env bash
# 获取 Chrome Web Store 发布用的 refresh token（一次性操作）
#
# 前置步骤（Google Cloud Console，用你上传插件的那个 Google 账号）:
#   1. 启用 Chrome Web Store API:
#      https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com
#   2. 创建 OAuth 客户端，类型选 "Desktop app"（凭据页面:
#      https://console.cloud.google.com/apis/credentials/oauthclient）
#   3. 把生成的 Client ID / Client Secret 作为参数运行本脚本:
#
#        ./scripts/cws-auth.sh <CLIENT_ID> <CLIENT_SECRET>
#
set -euo pipefail

CLIENT_ID="${1:?用法: ./scripts/cws-auth.sh <CLIENT_ID> <CLIENT_SECRET>}"
CLIENT_SECRET="${2:?缺少 CLIENT_SECRET}"

REDIRECT_PORT=47191
REDIRECT_URI="http://127.0.0.1:${REDIRECT_PORT}"
SCOPE="https://www.googleapis.com/auth/chrome.webstore.publish"

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

AUTH_URL="https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&access_type=offline&prompt=consent"

echo "➊ 在浏览器打开下面的 URL，用插件开发者账号授权："
echo
echo "  ${AUTH_URL}"
echo
echo "➋ 授权后浏览器会跳转到一个打不开的地址(这是正常的)，"
echo "   从地址栏复制 code= 后面的那串授权码（到 & 之前）"
printf "➌ 粘贴授权码: "
read -r CODE

RESPONSE=$(curl -fsS https://oauth2.googleapis.com/token \
	-d "client_id=${CLIENT_ID}" \
	-d "client_secret=${CLIENT_SECRET}" \
	-d "code=${CODE}" \
	-d "grant_type=authorization_code" \
	-d "redirect_uri=${REDIRECT_URI}")

REFRESH_TOKEN=$(echo "$RESPONSE" | node -e "
	let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
		const j=JSON.parse(s);
		if(!j.refresh_token){ console.error('响应中没有 refresh_token（授权码可能被用过，重新从 ➊ 开始）'); process.exit(1);}
		console.log(j.refresh_token);
	})
")

append_env() {
	local key="$1" value="$2"
	if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
		sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
	else
		echo "${key}=${value}" >>"$ENV_FILE"
	fi
}

append_env "CWS_CLIENT_ID" "$CLIENT_ID"
append_env "CWS_CLIENT_SECRET" "$CLIENT_SECRET"
append_env "CWS_REFRESH_TOKEN" "$REFRESH_TOKEN"

echo
echo "✅ 凭据已写入 ${ENV_FILE}（已被 gitignore）"
echo "   现在可以运行 ./scripts/publish.sh 发布了"

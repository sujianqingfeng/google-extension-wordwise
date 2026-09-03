# Wordwise

一款帮助中文用户在英文网页中积累词汇的 Chrome 扩展(MV3,基于 [WXT](https://wxt.dev) 构建)。

## 功能

- **生词遮罩**:收藏的单词在网页中以虚线下划线标出,点击即可查看释义;SPA 路由切换、滚动加载的内容会自动补标。
- **划词查询**:按住 `Alt` 拖选(或选中后按 `Alt`)英文单词/句子,弹出查询面板——词典释义、音标发音、AI 文本翻译、语法分析。
- **段落翻译**:鼠标悬停在英文段落上,点击浮出的 `W` 按钮,在原文下方插入中文译文。
- **侧边栏**:点击工具栏图标打开,使用谷歌账号登录。
- **实时同步**:任意标签页收藏/取消收藏,所有已打开页面立即更新遮罩,无需刷新;侧边栏登录后,已打开的页面也会直接生效。

快捷键速查:

| 操作                         | 方式                                |
| ---------------------------- | ----------------------------------- |
| 查询选中文本                 | `Alt` + 拖选 / 选中后按 `Alt`       |
| 打开被点击遮罩的详情         | 直接点击遮罩                        |
| 让点击穿透到页面(如跟随链接) | `Cmd` + 点击遮罩                    |
| 关闭查询面板                 | `Esc` 或点击面板外区域              |
| 播放单词发音                 | 点击喇叭图标或 `Ctrl` + `S`(面板内) |

## 开发

```bash
pnpm install        # 安装依赖(需要 Node 22+)
pnpm dev            # 开发模式,自动加载到浏览器
pnpm build          # 生产构建,产物在 output/chrome-mv3
pnpm lint           # oxlint
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest 单元测试
pnpm test:e2e       # e2e:以 mock 账号构建并安装到受管 Chrome,
                    # 对 e2e/fixture/index.html 断言遮罩流程(需要 PATH 上有 chrome-devtools CLI)
```

登录依赖 Google OAuth(`identity` 权限)与 `VITE_BASE_API_URL` 指向的后端服务;带 `WORDWISE_DEV_MOCK=1` 构建时会内置一个 mock 账号(`pnpm dev` 与 e2e 均使用),无需真实登录。

## 发布

推送 `*.*.*` 格式的 tag 触发 GitHub Actions:构建、打包并将 zip 附加到 Release。

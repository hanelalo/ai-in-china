# AI in China

以中文社区视角收录全球开源的 agent、skill、mcp、harness、编排器、基础设施等 AI 项目——源自 DeepSeek harness 社区征集，持续收录中文社区关注的开源项目。

- **数据即源码**：每个项目一个 JSON 文件，存放在 `src/data/projects/`
- **静态站点**：Astro 构建，可部署到 Cloudflare Pages / Vercel / GitHub Pages
- **社区提交**：网站提交表单 → 预填 GitHub Issue → 维护者审核入库；也支持直接提 PR

## 开发

```bash
pnpm install
pnpm dev       # 本地预览 http://localhost:4321
pnpm build     # 构建静态站点（输出到 dist/）
pnpm preview   # 本地预览构建产物
```

## 收录新项目（维护者）

```bash
GITHUB_TOKEN=xxx pnpm add-project owner/name \
  --category agent --summary "一句话中文介绍"
```

也可以从 JSONL 批量导入（比如新的评论区数据）：

```bash
pnpm import-jsonl [输入文件] [--force]
```

## 更新元数据

```bash
GITHUB_TOKEN=xxx pnpm sync   # 刷新 stars / description / topics / language
```

## 校验

```bash
pnpm validate   # CI 中也会运行，检查数据 schema
```

## 目录结构

- `src/data/projects/` — 项目数据（每个仓库一个 JSON）
- `src/data/categories.json` — 分类定义
- `src/data/site.json` — 站点配置（发布前把 githubRepo 改成你的仓库）
- `src/pages/` — Astro 页面
- `scripts/` — 维护脚本（add-project / sync / validate / import-jsonl）
- `.github/` — Issue 模板与 CI

## 发布前

1. 在 `src/data/site.json` 中设置 `githubRepo`（提交表单的 Issue 链接指向这里）
2. 把 `astro.config.mjs` 里的 `site` 改成正式域名
3. 推送到 GitHub 后部署（Cloudflare Pages / Vercel 均可）

# 贡献指南

欢迎收录中文 AI 社区关注的开源 AI 项目。两种方式任选：

## 方式一：网站表单（推荐）

打开网站的「提交项目」页，填写表单，会自动打开一个预填好的 GitHub Issue。维护者审核后入库。

## 方式二：直接提 PR

1. Fork 本仓库
2. 运行（需要本机可访问 GitHub API）：

   ```bash
   GITHUB_TOKEN=xxx pnpm add-project owner/name \
     --category agent --summary "一句话中文介绍"
   ```

   或者在 `src/data/projects/` 下手动创建 `<owner>--<name>.json`（参考已有文件）
3. 本地跑 `pnpm validate`，通过后提交 PR
4. 等待合并，CI 会自动校验数据

## 收录标准

- 项目属于 AI 相关：agent、skill、mcp、harness、orchestrator、infra、ui、eval 等
- 项目在中文 AI 社区中被讨论、使用，或对中文用户有实际价值
- 仓库可访问、内容合规

## 数据 schema

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| repo | 是 | GitHub 仓库，owner/name |
| category | 是 | 分类 id，见 `src/data/categories.json` |
| summary | 是 | 一句话中文介绍 |
| description | 否 | GitHub 原始描述 |
| language | 否 | 主要语言 |
| topics | 否 | GitHub topics |
| stars | 是 | GitHub star 数 |
| website | 否 | 项目主页 |
| platform | 否 | 适配平台，如 deepseek / openai-compatible |
| tags | 否 | 中文补充标签 |
| status | 是 | active / archived |
| source | 是 | 收录来源 |
| addedAt | 是 | 收录日期 YYYY-MM-DD |

#!/usr/bin/env node
/**
 * 通过 GitHub API 拉取仓库元数据，生成符合 schema 的项目条目。
 *
 * 用法:
 *   GITHUB_TOKEN=xxx node scripts/add-project.mjs owner/name \
 *     --category agent --summary "一句话中文介绍" \
 *     [--website https://...] [--platform deepseek,openai-compatible] [--tags 飞书,桌面] [--force]
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data/projects');
const args = process.argv.slice(2);
const repo = args.find((a) => !a.startsWith('--'));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
};
const force = args.includes('--force');

if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
  console.error('用法: node scripts/add-project.mjs owner/name --category agent --summary "..." [--website url] [--platform a,b] [--tags a,b]');
  process.exit(1);
}
const category = flag('category');
const summary = flag('summary');
if (!category || !summary) {
  console.error('--category 和 --summary 为必填');
  process.exit(1);
}

const categories = JSON.parse(await readFile(join(root, 'src/data/categories.json'), 'utf8'));
if (!categories.some((c) => c.id === category)) {
  console.error(`未知分类: ${category}`);
  process.exit(1);
}

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'ai-in-china' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
if (!res.ok) {
  console.error(`GitHub API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
const g = await res.json();

const slug = repo.replace(/\//g, '--');
const file = join(dataDir, `${slug}.json`);
if (!force) {
  const existing = new Set((await readdir(dataDir)).filter((f) => f.endsWith('.json')));
  if (existing.has(`${slug}.json`)) {
    console.error(`已存在 ${slug}.json，加 --force 可覆盖`);
    process.exit(1);
  }
}
await mkdir(dataDir, { recursive: true });

const entry = {
  repo,
  category,
  summary,
  description: g.description ?? null,
  language: g.language ?? null,
  topics: Array.isArray(g.topics) ? g.topics : [],
  stars: g.stargazers_count ?? 0,
  website: flag('website') ?? null,
  platform: (flag('platform') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  tags: (flag('tags') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  status: g.archived ? 'archived' : 'active',
  source: 'manual',
  addedAt: new Date().toISOString().slice(0, 10),
};

await writeFile(file, JSON.stringify(entry, null, 2) + '\n', 'utf8');
console.log(`✓ 已写入 ${file}（${g.stargazers_count} stars）`);
const v = spawnSync(process.execPath, [join(root, 'scripts/validate.mjs')], { stdio: 'inherit' });
process.exit(v.status ?? 1);

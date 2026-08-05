#!/usr/bin/env node
/**
 * 批量刷新 GitHub 元数据（stars / description / topics / language / archived 状态）。
 *
 * 注意: 需要 GITHUB_TOKEN（当前项目有 300+ 仓库，远超匿名 API 的 60 次/小时限额）:
 *   GITHUB_TOKEN=xxx node scripts/sync-stars.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data/projects');

if (!process.env.GITHUB_TOKEN) {
  console.error('缺少 GITHUB_TOKEN，请设置后重试（匿名 API 限额只有 60 次/小时）');
  process.exit(1);
}
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'ai-in-china',
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json')).sort();
let updated = 0;
let failed = 0;
let i = 0;

async function syncRepo(file) {
  const path = join(dataDir, file);
  const p = JSON.parse(await readFile(path, 'utf8'));
  const res = await fetch(`https://api.github.com/repos/${p.repo}`, { headers });
  if (!res.ok) {
    failed += 1;
    console.error(`✗ ${p.repo} -> HTTP ${res.status}`);
    return;
  }
  const g = await res.json();
  const next = {
    stars: g.stargazers_count ?? p.stars,
    description: g.description ?? p.description,
    topics: Array.isArray(g.topics) ? g.topics : p.topics,
    language: g.language ?? p.language,
  };
  const changed = Object.keys(next).filter((k) => JSON.stringify(p[k]) !== JSON.stringify(next[k]));
  if (g.archived && p.status !== 'archived') changed.push('status');
  if (!changed.length) return;

  Object.assign(p, next);
  if (g.archived) p.status = 'archived';
  await writeFile(path, JSON.stringify(p, null, 2) + '\n', 'utf8');
  updated += 1;
  console.log(`↻ ${p.repo} -> stars=${p.stars} (${changed.join(', ')})`);
}

const workers = Array.from({ length: 6 }, async () => {
  while (i < files.length) {
    const file = files[i];
    i += 1;
    await syncRepo(file);
  }
});
await Promise.all(workers);

console.log(`同步完成: 更新 ${updated}，失败 ${failed}，共 ${files.length}`);
process.exit(failed ? 1 : 0);

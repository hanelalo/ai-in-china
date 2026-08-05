#!/usr/bin/env node
/**
 * 从 JSONL 批量导入项目数据（例如之前从 X 评论区扒下来的数据）。
 *
 * 用法:
 *   node scripts/import-jsonl.mjs [输入文件] [--force]
 * 默认输入: /Users/hanelalo/develop/wiki/deepseek-harness-projects.jsonl
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data/projects');
const args = process.argv.slice(2);
const input =
  args.find((a) => !a.startsWith('--')) ??
  '/Users/hanelalo/develop/wiki/deepseek-harness-projects.jsonl';
const force = args.includes('--force');

const today = new Date().toISOString().slice(0, 10);
const categories = JSON.parse(await readFile(join(root, 'src/data/categories.json'), 'utf8'));
const valid = new Set(categories.map((c) => c.id));

const lines = (await readFile(input, 'utf8')).split('\n').filter((l) => l.trim());
await mkdir(dataDir, { recursive: true });
const existing = new Set((await readdir(dataDir)).filter((f) => f.endsWith('.json')));

let created = 0;
let skipped = 0;
let failed = 0;
const slugs = new Set();

for (const line of lines) {
  try {
    const raw = JSON.parse(line);
    if (!raw.repo || typeof raw.repo !== 'string') throw new Error('缺少 repo 字段');
    if (!valid.has(raw.category)) throw new Error(`未知分类: ${raw.category}`);

    const slug = raw.repo.replace(/\//g, '--');
    if (slugs.has(slug)) throw new Error(`slug 冲突: ${slug}`);
    slugs.add(slug);

    const file = `${slug}.json`;
    if (existing.has(file) && !force) {
      skipped += 1;
      continue;
    }

    const entry = {
      repo: raw.repo,
      category: raw.category,
      summary: raw.summary ?? '',
      description: raw.description ?? null,
      language: raw.language ?? null,
      topics: Array.isArray(raw.topics) ? raw.topics : [],
      stars: Number(raw.stars ?? 0),
      website: null,
      platform: [],
      tags: [],
      status: raw.category === 'unavailable' ? 'archived' : 'active',
      source: 'deepseek-harness-x',
      addedAt: today,
    };
    await writeFile(join(dataDir, file), JSON.stringify(entry, null, 2) + '\n', 'utf8');
    created += 1;
  } catch (err) {
    failed += 1;
    console.error(`✗ ${line.slice(0, 80)}… -> ${err.message}`);
  }
}

console.log(`导入完成: 新建 ${created}，跳过 ${skipped}，失败 ${failed}（共 ${lines.length} 条）`);
process.exit(failed ? 1 : 0);

#!/usr/bin/env node
/**
 * 校验 src/data/projects/ 下所有项目文件，供本地与 CI 使用。
 * 用法: node scripts/validate.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data/projects');
const categories = JSON.parse(await readFile(join(root, 'src/data/categories.json'), 'utf8'));
const validCategories = new Set(categories.map((c) => c.id));

const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json')).sort();
const errors = [];
const slugs = new Set();

function check(cond, file, msg) {
  if (!cond) errors.push(`${file}: ${msg}`);
}

for (const file of files) {
  let p;
  try {
    p = JSON.parse(await readFile(join(dataDir, file), 'utf8'));
  } catch (err) {
    errors.push(`${file}: JSON 解析失败 (${err.message})`);
    continue;
  }

  check(
    typeof p.repo === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(p.repo),
    file,
    'repo 必须是 owner/name 格式'
  );
  check(validCategories.has(p.category), file, `category 必须是 ${[...validCategories].join('/')} 之一`);
  check(typeof p.summary === 'string' && p.summary.trim().length > 0, file, 'summary 不能为空');
  check(Number.isInteger(p.stars) && p.stars >= 0, file, 'stars 必须是非负整数');
  check(p.language === null || typeof p.language === 'string', file, 'language 必须是字符串或 null');
  check(Array.isArray(p.topics) && p.topics.every((t) => typeof t === 'string'), file, 'topics 必须是字符串数组');
  check(Array.isArray(p.platform) && p.platform.every((t) => typeof t === 'string'), file, 'platform 必须是字符串数组');
  check(Array.isArray(p.tags) && p.tags.every((t) => typeof t === 'string'), file, 'tags 必须是字符串数组');
  check(p.website === null || /^https?:\/\//.test(p.website), file, 'website 必须是 null 或 http(s) 链接');
  check(/^\d{4}-\d{2}-\d{2}$/.test(p.addedAt), file, 'addedAt 必须是 YYYY-MM-DD');
  check(['active', 'archived'].includes(p.status), file, 'status 必须是 active/archived');

  const slug = p.repo.replace(/\//g, '--');
  check(slug === file.replace(/\.json$/, ''), file, `文件名必须是 ${slug}.json`);
  if (slugs.has(slug)) errors.push(`重复 slug: ${slug}`);
  slugs.add(slug);
}

if (errors.length) {
  console.error(`校验失败: ${errors.length} 个问题`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ 校验通过: ${files.length} 个项目`);

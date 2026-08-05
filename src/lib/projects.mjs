import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Astro 构建时会把页面代码打包进 dist/.prerender，不能依赖 import.meta.url，
// 统一以项目根目录（process.cwd()）为基准解析数据目录。
const dataDir = resolve(process.cwd(), 'src/data/projects');

export async function getProjects() {
  const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json'));
  const projects = await Promise.all(
    files.map(async (f) => JSON.parse(await readFile(join(dataDir, f), 'utf8')))
  );
  return projects;
}

export function slugOf(project) {
  return project.repo.replace(/\//g, '--');
}

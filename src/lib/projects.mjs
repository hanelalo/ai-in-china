// 用 Vite 的 import.meta.glob 在构建期打包所有项目 JSON：
// 静态数据随 bundle 走，不依赖 node:fs，因此在 Cloudflare 运行时也能执行。
const projectModules = import.meta.glob('../data/projects/*.json', { eager: true });

export function getProjects() {
  return Object.values(projectModules).map((mod) => mod.default);
}

export function slugOf(project) {
  return project.repo.replace(/\//g, '--');
}

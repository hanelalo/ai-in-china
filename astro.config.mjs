// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // 发布前把这里改成正式域名，用于生成 canonical URL
  site: 'https://ai-in-china.example.com',
  output: 'static',
});

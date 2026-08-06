// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 正式域名；DNS 解析和部署需要你在域名服务商和托管平台配置
  site: 'https://harness-x.dev',
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    sitemap({
      // 排除 404 页(noindex,不应进 sitemap)
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
});

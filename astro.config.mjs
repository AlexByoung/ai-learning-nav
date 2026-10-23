// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://alexbyoung.github.io/ai-learning-nav/
// All internal links must go through withBase() in src/lib/url.ts so they keep the /ai-learning-nav/ prefix.
export default defineConfig({
  site: 'https://alexbyoung.github.io',
  base: '/ai-learning-nav',
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});

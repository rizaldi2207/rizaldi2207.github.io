// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical origin. BaseHead builds canonical + Open Graph URLs against this,
  // and the sitemap is emitted for it — so it must be the live domain, never a
  // placeholder. Deployed to Netlify; the custom domain is configured there, not
  // via a CNAME file in the repo.
  site: 'https://appsecmonarch.com',
  integrations: [tailwind(), preact(), sitemap()],
  markdown: {
    shikiConfig: {
      // Shiki injects its palette as an inline style on <pre>, which beats any
      // scoped CSS. A named theme therefore hardcodes its own background and
      // ignores the design tokens. 'css-variables' makes it emit
      // var(--astro-code-*) instead, so Layout.astro stays the single source
      // of truth for code-block colors in both themes.
      theme: 'css-variables',
      wrap: false,
    },
  },
});
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { toStarlightSidebar } from '../src/docs/publicDocsCatalog.js';

export default defineConfig({
  site: 'https://docs.aispaceflow.com',
  legacy: {
    collections: true,
  },
  integrations: [
    starlight({
      title: 'AISpaceFlow Docs',
      description: 'Documentation for AISpaceFlow — the local-first, AI-powered diagramming tool.',
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/Logo_aispaceflow.svg',
        alt: 'AISpaceFlow',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/ISMARZDEV/flow-desing' },
      ],
      editLink: {
        baseUrl: 'https://github.com/ISMARZDEV/flow-desing/edit/main/docs-site/src/content/docs/',
      },
      // Root locale keeps English at clean URLs (/introduction not /en/introduction)
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        tr: { label: 'Türkçe', lang: 'tr' },
      },
      sidebar: toStarlightSidebar(),
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          content: `
            import { initializeSurfaceAnalytics } from '../../src/services/analytics/surfaceAnalyticsClient';

            const analytics = initializeSurfaceAnalytics({
              surface: 'docs',
              apiKey: import.meta.env.PUBLIC_POSTHOG_KEY,
              apiHost: import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
              enabled: import.meta.env.PUBLIC_ENABLE_ANALYTICS === 'true',
            });

            analytics.capturePageView('docs_page_viewed');

            document.addEventListener('click', (event) => {
              const element = event.target instanceof Element ? event.target.closest('a') : null;
              if (!(element instanceof HTMLAnchorElement)) return;

              const href = element.href || '';
              const target = element.dataset.analyticsTarget || null;
              const placement = element.dataset.analyticsPlacement || null;
              const explicitEvent = element.dataset.analyticsEvent || null;

              if (explicitEvent) {
                analytics.capture(explicitEvent, { href, target, placement });
                return;
              }

              if (href.includes('app.aispaceflow.com')) {
                analytics.capture('docs_open_app_clicked', { href, target: 'app', placement });
                return;
              }

              if (href.includes('github.com/ISMARZDEV/flow-desing')) {
                analytics.capture('docs_github_clicked', { href, target: 'github', placement });
              }
            });
          `,
        },
      ],
    }),
  ],
});

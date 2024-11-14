import { useRouter } from 'next/router';
import { useConfig } from 'nextra-theme-docs';

export default {
  logo: (
    <>
      <img src="/favicon-32x32.png" style={{ width: '30px', height: '30px' }} />
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>Semantic Kernel for JavaScript</span>
    </>
  ),
  docsRepositoryBase: 'https://github.com/afshinm/semantic-kernel-js/tree/main/docs',
  project: {
    link: 'https://github.com/afshinm/semantic-kernel-js',
  },
  head: function useHead() {
    const config = useConfig();
    const { route } = useRouter();
    const image = 'kernel-infographic.jpeg';

    const description =
      config.frontMatter.description ||
      'Semantic Kernel is a lightweight, open-source development kit that lets you easily build AI agents and integrate the latest AI models';
    const title = config.title + (route === '/' ? '' : ' - Semantic Kernel for JavaScript');

    return (
      <>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />

        <meta name="msapplication-TileColor" content="#fff" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site:domain" content="kerneljs.com" />
        <meta name="twitter:url" content="https://kerneljs.com" />
        <meta name="apple-mobile-web-app-title" content="kerneljs" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </>
    );
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  themeSwitch: {
    useOptions() {
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      };
    },
  },
  footer: {
    content: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://kerneljs.com" target="_blank">
          Semantic Kernel for JavaScript
        </a>
        .
      </span>
    ),
  },
};

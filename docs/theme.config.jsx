export default {
  logo: (
    <>
      <img src="/sk.png" style={{ width: '30px', height: '30px' }} />
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>Semantic Kernel for JavaScript</span>
    </>
  ),
  docsRepositoryBase: 'https://github.com/semantickernel/semantic-kernel/tree/main/docs',
  project: {
    link: 'https://github.com/semantickernel/semantic-kernel',
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

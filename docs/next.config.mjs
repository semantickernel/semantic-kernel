import nextra from 'nextra'

const nextjsConfigs = {
  redirects: () => {
    return [
      {
        source: '/getting-started',
        destination: '/getting-started/quick-start-guide',
        permanent: true,
      },
    ]
  },

}

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx'
})

export default withNextra(nextjsConfigs);

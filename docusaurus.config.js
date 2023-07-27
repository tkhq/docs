// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Turnkey Documentation',
  tagline: 'Programmatic key management',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://docs.turnkey.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'tkhq', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/og-image.png',
      navbar: {
        title: '',
        logo: {
          alt: 'Turnkey Logo',
          src: 'img/Logo_black.png',
          srcDark: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Guides',
          },
          {
            position: 'left',
            label: "Quickstart",
            to: '/getting-started/quickstart',
          },
          {
            position: 'left',
            label: "API",
            to: '/docs/getting-started/quickstart',
          },
          // Need to add API reference -- point this Nav heading there. 
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            to: 'https://github.com/tkhq',
            label: 'GitHub',
            position: 'right',
          },
          {
            to: 'https://beta.turnkey.io',
            label: 'Dashboard',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Guides',
            items: [
              {
                label: 'Quickstart',
                to: '/docs/getting-started/Quickstart',
              },
            ],
          },
          {
            title: 'Twitter',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/turnkeyhq',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/tkhq/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Turnkey. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;

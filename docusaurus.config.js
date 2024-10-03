// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Turnkey Documentation",
  tagline: "Programmatic key management",
  favicon: "img/favicon.svg",

  // Set the production url of your site here
  url: "https://docs.turnkey.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "tkhq", // Usually your GitHub org/user name.
  projectName: "docs", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
    [
      "redocusaurus",
      {
        specs: [
          {
            spec: "api/public_api.swagger.json",
            url: "api/public_api.swagger.json",
            route: "/api/",
          },
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/og-image.png",
      navbar: {
        title: "",
        logo: {
          alt: "Turnkey Logo",
          src: "img/Logo_black.png",
          srcDark: "img/logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "overview",
            position: "left",
            label: "Documentation",
          },
          {
            to: "/getting-started/quickstart",
            label: "Quickstart",
            position: "left",
            activeBaseRegex: "/docs/getting-started/quickstart/", // Regex to explicitly match only this path
          },
          {
            type: "doc",
            docId: "solutions/embedded-wallets/overview",
            position: "left",
            label: "Solutions",
          },
          {
            type: "doc",
            docId: "sdks/introduction",
            position: "left",
            label: "SDK Reference",
          },
          {
            position: "left",
            label: "API Reference",
            to: "/api",
          },
          {
            position: "left",
            label: "Changelog",
            to: "/changelog",
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            to: "https://github.com/tkhq",
            label: "GitHub",
            position: "right",
          },
          {
            to: "https://app.turnkey.com",
            label: "Dashboard",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Guides",
            items: [
              {
                label: "Quickstart",
                to: "/getting-started/quickstart",
              },
            ],
          },
          {
            title: "Twitter",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/turnkeyhq",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/tkhq/",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Turnkey`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: "89KSB43UFT",
        // Public API key: it is safe to commit it
        apiKey: "a0740f141135937727389d897f51fb56",
        indexName: "turnkey",
        contextualSearch: true,
        searchPagePath: false,
      },
    }),
};

module.exports = config;

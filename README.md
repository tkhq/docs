# Turnkey docs

This repo hosts the documentation hosted at https://docs.turnkey.com.

## Development

### Prerequisites

To work with this documentation locally, you'll need:

- Node.js (see `.nvmrc` for the recommended version)
- npm or yarn

### Local Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview documentation changes locally:

```sh
# Install Mintlify CLI globally
npm i -g mintlify

# Start the local development server
mintlify dev
```

This will start a local development server where you can preview your changes in real-time.

If you encounter any issues with the development server:

- Run `mintlify install` to reinstall dependencies
- Ensure you're running the command in a folder with `docs.json` (Mintlify's configuration file)

> **Important:** If you previously worked with the Docusaurus version of this site, make sure to delete the `build` and `.docusaurus` folders before running the Mintlify docs site locally. Otherwise, you may experience style conflicts.

### Deployment

Changes to the documentation are automatically deployed when merged to the main branch through our CI/CD pipeline.

### Mintlify Dashboard

You can access the Mintlify dashboard for this project at:
[dashboard.mintlify.com](https://dashboard.mintlify.com/turnkey-0e7c1f5b/turnkey-0e7c1f5b)

## The dashboard provides analytics, deployment status, and other management features for our documentation.

## Legacy Documentation

The following information pertains to the previous Docusaurus-based documentation setup.

### Algolia

We use the Algolia plugin for Docusaurus to manage search on our docs page. The primary dashboard can be accessed via https://dashboard.algolia.com/apps/89KSB43UFT/dashboard. Reach out to Jack, Arnaud, or Andrew for access.

#### Crawling

Our crawler settings can be found at https://crawler.algolia.com/admin/crawlers/15584ae7-61de-4f26-af35-4bc55d0de0b5/overview. Algolia crawls our docs site once a week on Monday at 12:31 (UTC). This is simply the default behavior. There are cases where we may want to forcefully trigger Algolia to crawl/index our site, i.e. when we do a big refactor or otherwise reorganize the structure of our docs significantly.

In order to manually trigger a new crawl, use the `Restart crawling` button:

<img src="./static/algolia-crawler.png" />

Our docs site is small, so each crawl is quick (~30-60s).

### Vercel

Each push to Github will trigger a Vercel build:

<img src="./static/vercel.png" />

This is a convenient way to view changes, add feedback, and collaborate overall. Any build can also be promoted to production, if need be.

### Legacy Local Development

#### With yarn

```sh
# Compiles
yarn build

# Starts the dev server on port 3000
yarn start
```

#### With docker

```sh
$ docker buildx create --use # This is only required on MacOS
$ make run-dev
```

This will build an docker image using the Dockerfile with the `development` target and then run it and port forward.
You can view the website at `http://localhost:3000/`

You can build a docker image running nginx and only a static build of the HTML/CSS and JS with:

```sh
$ make image
```

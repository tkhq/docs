# Turnkey docs

This repo hosts the documentation hosted at https://docs.turnkey.com.

It's built with [Docusaurus](https://docusaurus.io/).

## Algolia

We use the Algolia plugin for Docusaurus to manage search on our docs page. The primary dashboard can be accessed via https://dashboard.algolia.com/apps/89KSB43UFT/dashboard. Reach out to Jack, Arnaud, or Andrew for access.

### Crawling

Our crawler settings can be found at https://crawler.algolia.com/admin/crawlers/15584ae7-61de-4f26-af35-4bc55d0de0b5/overview. Algolia crawls our docs site once a week on Monday at 12:31 (UTC). This is simply the default behavior. There are cases where we may want to forcefully trigger Algolia to crawl/index our site, i.e. when we do a big refactor or otherwise reorganize the structure of our docs significantly.

In order to manually trigger a new crawl, use the `Restart crawling` button:

<img src="./static/algolia-crawler.png" />

Our docs site is small, so each crawl is quick (~30-60s).

## Development

### Vercel

Each push to Github will trigger a Vercel build:

<img src="./static/vercel.png" />

This is a convenient way to view changes, add feedback, and collaborate overall. Any build can also be promoted to production, if need be.

### Local Development

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

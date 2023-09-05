# Turnkey docs

This repo hosts the documentation hosted at https://docs.turnkey.com.

It's built with [Docusaurus](https://docusaurus.io/).

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
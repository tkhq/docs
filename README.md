# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Local Development

```
$ docker buildx create --use # This is only required on MacOS
$ make run-dev
```

This will build an docker image using the Dockerfile with the `development` target and then run it and port forward.
You can view the website at `http://localhost:3000/`

### Build

```
$ image
```

This builds a Docker image running nginx and only a static build of the HTML/CSS and JS

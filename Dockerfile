## Base ########################################################################
# Use a larger node image to do the build for native deps (e.g., gcc, python)
FROM node:lts-bookworm@sha256:f4698d49371c8a9fa7dd78b97fb2a532213903066e47966542b3b1d403449da4 as base

# Reduce npm log spam and colour during install within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Switch to the node user vs. root
USER node

RUN mkdir /home/node/app

# We'll run the app as the `node` user, so put it in their home directory
WORKDIR /home/node/app

# Install dependencies
COPY --chown=node:node package.json /home/node/app/
COPY --chown=node:node package-lock.json /home/node/app/
COPY --chown=node:node yarn.lock /home/node/app/
RUN npm install


# Copy the source code over
COPY --chown=node:node . /home/node/app/

## Development #################################################################
# Define a development target that installs devDeps and runs in dev mode
FROM base as development
WORKDIR /home/node/app
COPY --chown=node:node --from=base /home/node/app/node_modules /home/node/app/node_modules
# Expose port 3000
EXPOSE 3000
# Start the app in debug mode so we can attach the debugger
CMD ["npm", "start"]

## Production ##################################################################
# Also define a production target which doesn't use devDeps
FROM base as production
WORKDIR /home/node/app
COPY --chown=node:node --from=development /home/node/app/node_modules /home/node/app/node_modules
# Build the Docusaurus app
RUN npm run build

## Deploy ######################################################################
# Use a stable nginx image
FROM nginx:bookworm@sha256:08bc36ad52474e528cc1ea3426b5e3f4bad8a130318e3140d6cfe29c8892c7ef as deploy
WORKDIR /home/node/app
# Copy what we've installed/built from production
COPY --chown=node:node --from=production /home/node/app/build /usr/share/nginx/html/

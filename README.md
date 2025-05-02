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
The dashboard provides analytics, deployment status, and other management features for our documentation.

## Build & Code Generation

We provide the following Make targets to generate API reference content:

- `make install`: Install dependencies needed to run OpenAPI commands
- `make openapi-gen`: Run the OpenAPI generator CLI with custom arguments. See [scripts/openapi-gen/README.md](scripts/openapi-gen/README.md) for details.
- `make gen`: Default MDX generation for API reference under `api-reference/`.
- `make tags`: Generate the endpoint-tags MDX snippet at `snippets/data/endpoint-tags.mdx`.

These commands require Node.js and `ts-node`.

---

**Shared Snippets Usage Guidelines**

The docs in this repository utilize shared MDX snippets to ensure consistency and adherence to DRY principles across duplicate pages. When identical content is required in multiple locations, each duplicate page imports a shared snippet from the `/snippets/shared/` folder. This method minimizes maintenance overhead by centralizing content updates.

**Important:** Always update the shared MDX file rather than modifying individual duplicate pages. This guarantees that any change propagates throughout all references.

| Duplicate Page Path                                          | Shared MDX File                        |
| ------------------------------------------------------------ | -------------------------------------- |
| `concepts/policies/overview.mdx`                             | `/snippets/shared/policy-engine.mdx`   |
| `products/embedded-wallets/features/policy-engine.mdx`         | `/snippets/shared/policy-engine.mdx`   |
| `products/transaction-automation/features/export-wallets.mdx`  | `/snippets/shared/export-wallets.mdx`  |
| `products/transaction-automation/features/import-wallets.mdx`  | `/snippets/shared/import-wallets.mdx`  |

*Note: Duplicate pages must reside in separate file paths as required by `docs.json`. Mintlify restricts pages with identical content from sharing the same path to ensure correct sidebar behavior.*

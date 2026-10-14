# CRM MVP

## Get Started

This repo is a [pnpm](https://pnpm.io/) workspace (see `pnpm-workspace.yaml`) and expects the Node.js version in `.nvmrc`.

```bash
bash setup.sh
```

The above command executes the `setup.sh` script to set up the project by:

- Switching to the Node.js version in `.nvmrc` (through nvm when it is installed).
- Ensuring [pnpm](https://pnpm.io/) is installed globally, at the version in the root `package.json`.
- Removing the old `node_modules` and installing all dependencies.
- Building the shared `common` package, which the `express-server` and `next-client` apps need before they start.

Place the shared packages in the `packages` folder & the applications code in the `apps` folder. [`common`](./packages/common) holds the types, enums and helpers shared by `express-server` and `next-client`, it is compiled to `dist/` and `pnpm build`, `pnpm express` and `pnpm next` build it before the apps.
If you do not wish to use Turborepo, delete `turbo.json` and remove it from `devDependencies` of the package.json in the root directory.

Start an app in dev mode (`express` and `next` build `common` first),

```bash
pnpm next      # next-client
pnpm express   # express-server
```

Run a command in a specific workspace,

```bash
pnpm --filter <workspace> <command>   # eg. pnpm --filter express-server dev
```

Build, run, lint or test all your apps in one command thanks to [Turborepo's Pipelines](https://turborepo.org/docs/core-concepts/pipelines)

## Support Me

If you found this template helpful and saved your valuable time, consider [buying me a coffee](https://www.buymeacoffee.com/nish1896)

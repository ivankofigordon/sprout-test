# Sprout

Sprout is a life-progression platform designed to help people understand themselves, discover opportunities, and plan their next steps.

## Status

Sprout is in early development. The repository currently contains development tooling; application and shared-package workspaces are not yet implemented.

## Structure

| Path        | Purpose                                           |
| ----------- | ------------------------------------------------- |
| `apps/`     | Application workspaces.                           |
| `packages/` | Shared package workspaces.                        |
| `tests/`    | Repository tests.                                 |
| `.github/`  | GitHub configuration and collaboration templates. |
| `.husky/`   | Local commit hooks.                               |

## Setup

1. Install Git and Node.js `26.13.0`. Git must be available on `PATH`. The repository supports Node.js 26; use the version in `.nvmrc` to match CI.

2. Install pnpm:

   ```sh
   npm install --global pnpm@11.28.10
   ```

   The `packageManager` field pins the version. pnpm selects it automatically with its default settings.

3. From the repository root, check your tools and install dependencies:

   ```sh
   git --version
   node --version
   pnpm --version
   pnpm install --frozen-lockfile
   ```

> [!NOTE]
> On Windows, use Git for Windows to provide the shell used by the hooks.

Installation checks the toolchain and prepares local Git hooks.

If setup fails, see [Troubleshooting](CONTRIBUTING.md#troubleshooting).

## Commands

Run these commands from the repository root.

| Command               | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `pnpm build`          | Run workspace builds, including upstream builds.                    |
| `pnpm dev`            | Run workspace development tasks without caching.                    |
| `pnpm format`         | Format supported files with Prettier.                               |
| `pnpm format:check`   | Check formatting without editing files.                             |
| `pnpm lint`           | Run workspace lint tasks.                                           |
| `pnpm prepare`        | Install local Git hooks; runs automatically on installation.        |
| `pnpm test`           | Run root tests, followed by workspace tests; report either failure. |
| `pnpm test:root`      | Run root repository tests with Vitest.                              |
| `pnpm test:workspace` | Run workspace test tasks through Turborepo.                         |

Root tests use Vitest outside Turborepo caching. The current suite exercises actual Git hooks in disposable repositories. `pnpm test` runs both suites sequentially, continues after a suite fails, and exits unsuccessfully if either suite fails.

## Guidance

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution workflow, conventions, validation, and maintenance.

See [AGENTS.md](AGENTS.md) for coding agent guidance.

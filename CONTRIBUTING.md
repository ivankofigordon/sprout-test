# Contributing

## Workflow

1. Define substantial work with the appropriate issue template.
2. Follow the [setup instructions](README.md#setup). Start a short-lived, focused branch from the latest `main`; do not develop directly on `main`.
3. Implement one logical outcome. Keep unrelated changes separate, preserve existing work, and update affected tests.
4. Run the applicable validation and review the complete diff before committing.
5. Update affected documentation in a final documentation commit once the implementation is complete, before requesting review. Check that the guidance describes the finished work and agrees across documents.
6. Open a focused pull request using the repository template. Keep its title, description, validation evidence, and issue links current during review.
7. Merge only after required reviews and checks pass. The repository allows squash merging only and automatically deletes merged branches.

## Branches

Our repository branch naming convention uses a lowercase type and a concise kebab-case description, following the purpose-based pattern in [Conventional Branch](https://conventionalbranch.org/):

```text
type/description
```

For example:

```text
feat/user-profile
fix/commit-checks
chore/update-tooling
```

## Commits

Use atomic [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with the following structure:

```text
type(scope): description
```

The scope is optional. Use it to identify the affected area when useful.

Each commit should represent one coherent change and leave the repository in a valid state. Use a body when the rationale is not evident from the diff.

For example:

```text
chore: update repository tooling
fix: preserve unstaged changes
docs: clarify setup instructions
fix(hooks): preserve unstaged changes
```

Mark breaking changes with `!` before the colon or a `BREAKING CHANGE:` footer. For example:

```text
feat(api)!: require authentication for profile requests
```

Alternatively, describe the breaking change in a footer:

```text
feat(api): require authentication for profile requests

BREAKING CHANGE: Profile requests now require an access token.
```

Our [commitlint configuration](commitlint.config.mjs) extends the conventional preset with subject-case and header-max-length rules disabled to accept dependency-name casing and full dependency-update SHAs. Commit checks retain the default exemptions for generated messages, including merges, reverts, and fixups. PR-title validation sets `COMMITLINT_PR_TITLE=true` to disable those exemptions. Titles are checked without normalization or bot bypasses. The pre-commit hook formats staged supported files through [lint-staged](lint-staged.config.mjs); the commit-msg hook validates the message. Review any formatting changes.

## Pull requests

Use a [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) title suitable for the final squash commit and follow the [pull request template](.github/pull_request_template.md). If substantial work has no linked issue, explain why.

Resolve review discussions and re-run affected checks after material changes.

Before merging, confirm all applicable checks passed, even when they are not enforced by repository rules. Review the final squash commit message and use the pull request title as its subject.

## Conventions

These conventions are repository house style. Use each tool's documented syntax and filenames; let [EditorConfig](.editorconfig), [Prettier](prettier.config.mjs), and generators control formatting.

- Use UTF-8, LF, two-space indentation, and final newlines. EditorConfig preserves Markdown trailing spaces.
- Use lowercase kebab-case for custom filenames. Preserve recognized names such as `README.md`, `CONTRIBUTING.md`, and `pull_request_template.md`.
- Use sentence-case headings and CI step names.
- Order manifest fields as identity, toolchain, scripts, and dependencies. Alphabetize scripts and dependency entries.
- Group related entries by purpose throughout the repository. Order groups semantically and alphabetize independent entries within groups where useful. Use concise headings or group comments where the file format supports them, and separate groups with a blank line where practical.
- Put general configuration before specific overrides and preserve rule precedence and exceptions. Order workflow steps by execution and tests by behaviour.
- Let generators control generated files and their ordering. Do not hand-edit or re-sort their output.
- Keep shared guidance in one authoritative document and link to it. Use [README](README.md) for setup and commands, CONTRIBUTING for contributor conventions, and [AGENTS](AGENTS.md) for agent-specific guidance.
- Keep changes focused. Avoid unrelated reordering, speculative configuration, sorting plugins, and custom style enforcement.

### Code comments

Write comments that explain decisions, constraints, or non-obvious behaviour. Prefer clear names and straightforward code over comments that repeat the implementation. Keep comments accurate when behaviour changes.

Use [JSDoc](https://jsdoc.app/about-getting-started) for JavaScript API documentation or type hints when they add value. For TypeScript APIs that need explanation, use [TSDoc-compatible comments](https://tsdoc.org/) without repeating types already expressed in the code. Document relevant side effects, errors, and cleanup responsibilities. Comments are not required on every declaration.

### Ignore files

Ignore artifacts produced by the current workflow or natural repository use, including relevant platform equivalents. Avoid speculative outputs. Prettier reads the root `.gitignore`; `.prettierignore` adds only formatting-specific exclusions, currently the generated `pnpm-lock.yaml`.

## Validation

Run applicable checks before requesting review:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm build
pnpm lint
pnpm test
git diff --check
```

Choose additional checks according to the change's risk.

Installation and check commands should leave repository files unchanged; inspect the working tree and diff afterward.

> [!NOTE]
> The workspace directories are currently empty. Build and lint commands verify orchestration only; `pnpm test:root` runs the repository’s hook integration tests.

The [CI workflow](.github/workflows/ci.yml) runs on pushes to `main` and when pull requests targeting `main` are opened, updated with commits, or reopened. Ubuntu, macOS, and Windows each install dependencies with the frozen lockfile, run builds and tests, and check that the working tree remains unchanged. Formatting, lint, and commit-message validation run on Ubuntu. Independent checks continue after a failure when installation succeeded.

The separate [pull request title workflow](.github/workflows/pull-request-title.yml) validates titles, including after edits. Title edits do not restart or cancel the platform checks.

CI disables local hooks with `HUSKY=0`; the hook tests use isolated repositories with hooks enabled.

Local results do not confirm hosted cross-platform success. Confirm the GitHub runs after publication. Issue forms and the pull request template become available after default-branch publication.

## Maintenance

Keep direct dependencies exactly pinned and commit manifest changes with the generated lockfile. Use [pnpm](https://pnpm.io/) to update dependencies; do not edit the lockfile manually. Review compatibility and release notes before accepting updates.

Our [Dependabot configuration](.github/dependabot.yml) schedules weekly npm dependency and GitHub Actions updates. Automatic merging is not configured. Review and validate each update before merging. Security updates are separate from the weekly version-update schedule. Dependabot does not update our `.nvmrc` pin; review [Node.js](https://nodejs.org/) updates separately.

> [!IMPORTANT]
> Keep pnpm on version 11 while GitHub cannot read pnpm 12’s default two-document lockfile for dependency alerts and security updates. Recheck [GitHub’s supported ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories) before changing the major version.

When updating the toolchain or CI actions:

- Update the Node.js pin in `.nvmrc`. Change `package.json` engines when the supported major range changes; routine Node 26 updates retain `>=26 <27`.
- Update pnpm in `packageManager`. Regenerate the lockfile with the selected version if needed.
- Keep GitHub Actions pinned to full commit SHAs with release comments. Verify the release tag and SHA together when updating.
- Repeat installation and relevant checks after toolchain changes, including hosted CI on all three operating systems.
- Update the [README setup instructions](README.md#setup) in the final documentation commit.

## Troubleshooting

The repository records its toolchain, normalizes text files, and configures CI on Ubuntu, macOS, and Windows. Local machines can still differ in their shell, Git version, Git configuration, terminal, architecture, or managed-device settings.

If local validation behaves differently from CI:

- To reproduce CI, use the Node.js version in `.nvmrc` and the pnpm version in the `packageManager` field of `package.json`, as documented in [Setup](README.md#setup).
- Run `pnpm install --frozen-lockfile` before repeating the failing check.
- Check the working tree, diff, and line endings before debugging tool behaviour.
- Reproduce hook failures with `pnpm test:root`; it uses disposable repositories instead of user Git configuration.
- On Windows, prefer the same shell used by CI when comparing command behaviour. If using WSL, report whether the failure occurs in WSL, native Windows, or both.

Document confirmed recurring differences here rather than adding broad tooling or CI variants without evidence.

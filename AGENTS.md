# Agent guidance

Read [README.md](README.md) for setup and commands. Follow [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow, conventions, validation, and maintenance.

## Scope and evidence

- Follow the user’s instructions and agreed scope.
- Inspect the current branch, working tree, and relevant files before editing. Preserve existing and unrelated work.
- Check official documentation before introducing or changing tools or configuration. Distinguish verified facts, assumptions, and repository preferences.
- Before changing Turborepo configuration or commands, read `docs/README.md` and the relevant bundled documentation in the installed `turbo` package.
- Keep changes focused. Do not introduce frameworks, providers, or features outside the agreed scope.
- For material decisions, present options and a recommendation, then ask for the user’s input.

## Planning

- Work on a non-main branch using the [branch convention](CONTRIBUTING.md#branches).
- For multi-step work, identify the branch, affected files, atomic [Conventional Commit](CONTRIBUTING.md#commits) groups, and validation plan.
- Prepare and verify one commit at a time. Report the changes and validation results before requesting approval to stage or commit.
- Complete affected documentation in the final commit, following the [workflow](CONTRIBUTING.md#workflow). Keep shared conventions in CONTRIBUTING.md and link to them.

## Approvals

> [!IMPORTANT]
> Obtain explicit approval before staging, committing, pushing, opening a pull request, merging, changing repository settings, rewriting history, or deleting material files. Approval covers only the specified action and scope.

Stage only approved files. Preserve unrelated changes and leave unapproved work uncommitted.

## Validation and reporting

- Run checks appropriate to the change, following [Validation](CONTRIBUTING.md#validation).
- Keep hook tests isolated from user Git configuration and development data.
- Distinguish successful task orchestration from application coverage, and local results from hosted cross-platform verification.
- Check that documentation matches the implementation and uses consistent terminology.
- Report changes, validation results, limitations, and remaining uncommitted work.

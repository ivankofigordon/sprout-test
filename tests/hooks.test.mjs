import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

const root = fileURLToPath(new URL("../", import.meta.url));

function fixture(t, { prTitle = false } = {}) {
  const workspace = mkdtempSync(join(tmpdir(), "sprout hooks "));
  const directory = join(workspace, "repository");
  const configDirectory = join(workspace, "config");
  const globalConfig = join(workspace, "global.gitconfig");
  t.onTestFinished(() =>
    rmSync(workspace, { recursive: true, force: true, maxRetries: 3 }),
  );

  mkdirSync(directory);
  mkdirSync(configDirectory);
  writeFileSync(globalConfig, "");

  // Keep parent CI and Git settings from disabling or redirecting fixture hooks.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !key.toUpperCase().startsWith("GIT_") &&
        key !== "HUSKY" &&
        key !== "COMMITLINT_PR_TITLE",
    ),
  );
  Object.assign(env, {
    GIT_CONFIG_GLOBAL: globalConfig,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_TERMINAL_PROMPT: "0",
    XDG_CONFIG_HOME: configDirectory,
    ...(prTitle ? { COMMITLINT_PR_TITLE: "true" } : {}),
  });

  function run(command, args) {
    const result = spawnSync(command, args, {
      cwd: directory,
      encoding: "utf8",
      env,
      timeout: 60_000,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null, result.stdout + result.stderr);
    return result;
  }

  function git(...args) {
    const result = run("git", args);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    return result.stdout;
  }

  mkdirSync(join(directory, ".husky"));
  mkdirSync(join(directory, "template"));
  for (const file of [
    ".editorconfig",
    ".gitattributes",
    ".gitignore",
    ".husky/commit-msg",
    ".husky/pre-commit",
    ".prettierignore",
    "commitlint.config.mjs",
    "lint-staged.config.mjs",
    "package.json",
    "pnpm-workspace.yaml",
    "prettier.config.mjs",
  ]) {
    copyFileSync(join(root, file), join(directory, file));
  }
  symlinkSync(
    join(root, "node_modules"),
    join(directory, "node_modules"),
    "junction",
  );

  git("init", "--initial-branch=main", "--template=template");
  git("config", "user.name", "Hook test");
  git("config", "user.email", "hooks@example.invalid");
  git("config", "commit.gpgsign", "false");
  git("config", "core.autocrlf", "false");
  git("config", "core.hooksPath", ".disabled-hooks");
  git("add", ".");
  git("commit", "-m", "chore: initialize fixture");

  const installed = run(process.execPath, [
    join(root, "node_modules/husky/bin.js"),
  ]);
  assert.equal(installed.status, 0, installed.stdout + installed.stderr);
  assert.equal(git("config", "core.hooksPath").trim(), ".husky/_");

  return {
    git,
    read: (file) => readFileSync(join(directory, file), "utf8"),
    write: (file, contents) => writeFileSync(join(directory, file), contents),
    commit: (message) => run("git", ["commit", "--allow-empty", "-m", message]),
  };
}

test("commit-msg accepts conventional and dependency update messages", (t) => {
  const repo = fixture(t);
  for (const message of [
    "chore: verify hooks",
    "Merge branch main into feature",
    'Revert "feat: add profile"',
    "fixup! feat: add profile",
    "chore(deps-dev): bump Prettier from 3.9.8 to 3.9.9",
    "ci(deps): bump actions/checkout from " +
      "a".repeat(40) +
      " to " +
      "b".repeat(40),
  ]) {
    const result = repo.commit(message);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(repo.git("log", "-1", "--format=%s").trim(), message);
  }
});

test("commit-msg rejects invalid messages without creating a commit", (t) => {
  const repo = fixture(t);
  const head = repo.git("rev-parse", "HEAD");
  const result = repo.commit("update stuff");
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /subject-empty|type-empty/);
  assert.equal(repo.git("rev-parse", "HEAD"), head);
});

test("PR-title validation rejects generated commit messages", (t) => {
  const repo = fixture(t, { prTitle: true });
  for (const message of [
    "Merge branch main into feature",
    'Revert "feat: add profile"',
    "fixup! feat: add profile",
    "v1.2.3",
  ]) {
    const head = repo.git("rev-parse", "HEAD");
    const result = repo.commit(message);
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.equal(repo.git("rev-parse", "HEAD"), head);
  }
  for (const message of [
    "feat: add profile",
    "chore(deps-dev): bump Prettier from 3.9.8 to 3.9.9",
    "ci(deps): bump actions/checkout from " +
      "a".repeat(40) +
      " to " +
      "b".repeat(40),
  ]) {
    const result = repo.commit(message);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  }
});

test("pre-commit formats staged files with spaces in their paths", (t) => {
  const repo = fixture(t);
  repo.write("example file.json", '{"value":1}\n');
  repo.git("add", "--", "example file.json");
  const result = repo.commit("test: format staged file");
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(repo.git("show", "HEAD:example file.json"), '{ "value": 1 }\n');
  assert.equal(repo.git("status", "--porcelain"), "");
});

test("pre-commit rejects malformed files and restores staged content", (t) => {
  const repo = fixture(t);
  const head = repo.git("rev-parse", "HEAD");
  const malformed = '{"value":}\n';
  repo.write("recover.json", '{"value":1}\n');
  repo.git("add", "--", "recover.json");
  repo.write("recover.json", '{"value":2}\n');
  repo.write("unrelated.txt", "Keep this untracked.\n");
  repo.write("invalid.json", malformed);
  repo.git("add", "--", "invalid.json");
  const result = repo.commit("test: reject malformed file");
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /SyntaxError/);
  assert.equal(repo.git("rev-parse", "HEAD"), head);
  assert.equal(repo.git("show", ":invalid.json"), malformed);
  assert.equal(repo.read("invalid.json"), malformed);
  assert.equal(repo.git("show", ":recover.json"), '{"value":1}\n');
  assert.equal(repo.read("recover.json"), '{"value":2}\n');
  assert.equal(repo.read("unrelated.txt"), "Keep this untracked.\n");
  assert.equal(repo.git("stash", "list"), "");

  repo.write("invalid.json", '{"value":3}\n');
  repo.git("add", "--", "invalid.json", "recover.json");
  const recovered = repo.commit("test: recover after formatting failure");
  assert.equal(recovered.status, 0, recovered.stdout + recovered.stderr);
  assert.equal(repo.git("show", "HEAD:recover.json"), '{ "value": 2 }\n');
  assert.equal(repo.read("recover.json"), '{ "value": 2 }\n');
});

test("pre-commit formats staged content while preserving unstaged changes", (t) => {
  const repo = fixture(t);
  const original = "# Fixture\n\nFirst paragraph.\n\nSecond paragraph.\n";
  repo.write("partial.md", original);
  repo.git("add", "--", "partial.md");
  const seed = repo.commit("test: add partial staging fixture");
  assert.equal(seed.status, 0, seed.stdout + seed.stderr);

  const staged = original.replace("# Fixture", "#    Updated fixture");
  const formatted = original.replace("# Fixture", "# Updated fixture");
  const unstaged = staged.replace("Second paragraph.", "Unstaged paragraph.");
  repo.write("partial.md", staged);
  repo.git("add", "--", "partial.md");
  repo.write("partial.md", unstaged);
  repo.write("unrelated.txt", "Keep this untracked.\n");

  const result = repo.commit("test: preserve partial staging");
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(repo.git("show", "HEAD:partial.md"), formatted);
  assert.equal(
    repo.read("partial.md"),
    formatted.replace("Second paragraph.", "Unstaged paragraph."),
  );
  assert.equal(repo.read("unrelated.txt"), "Keep this untracked.\n");
  assert.equal(repo.git("diff", "--cached"), "");
  assert.equal(
    repo.git("status", "--porcelain"),
    " M partial.md\n?? unrelated.txt\n",
  );
});

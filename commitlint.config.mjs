export default {
  extends: ["@commitlint/config-conventional"],
  // Apply generated-message exemptions to commits only, not PR titles.
  defaultIgnores: process.env.COMMITLINT_PR_TITLE !== "true",
  rules: {
    // Full dependency-update SHAs can exceed the conventional header limit.
    "header-max-length": [0],
    // Dependency names retain their published casing.
    "subject-case": [0],
  },
};

Codecov setup and CI guidance
================================

This project uploads coverage artifacts from the `CI` workflow (job `build`) as `coverage-report`.

To enable Codecov reports in CI and the Codecov UI:

- Create a Codecov account and add the repository (or use your organization).
- Obtain the repository upload token from Codecov (Settings → Repository Upload Token).
- In GitHub, add a repository secret named `CODECOV_TOKEN` with that token value.

The `CI` workflow already contains the `codecov/codecov-action@v4` step:

- It reads `CODECOV_TOKEN` from repository secrets and uploads the `coverage` directory.
- The action is configured with `fail_ci_if_error: false` so missing token won't fail the job, but you won't get Codecov reports until the token is present.

Local quick test (with a token):

```bash
# run tests to generate coverage
npx vitest run --coverage

# upload to Codecov (example using bash uploader)
bash <(curl -s https://codecov.io/bash) -t "$CODECOV_TOKEN"
```

If you'd like, I can:

- Add this file to the repo and open a PR (done).
- Create a follow-up PR that adds a required `CODECOV_TOKEN` check (or fails CI when missing).
- Raise branch coverage by adding targeted tests — tell me which option to proceed with.

# Secrets & Vault Guidance

This document outlines recommended practices to move secrets out of code and runtime files and into a secrets manager (Vault, cloud provider secret stores, or GitHub Secrets). It includes examples for CI, local development, and containers.

Goals
- Keep secrets out of the repository.
- Enforce least-privilege access and rotation.
- Inject secrets into CI and runtime in a safe way.

Recommended secret stores
- GitHub Actions Secrets: easy for CI and repo-scoped workflows.
- HashiCorp Vault: good for dynamic secrets, rotation, and fine-grained policies.
- AWS Secrets Manager / Parameter Store: integrated with IAM for AWS deployments.
- Azure Key Vault / GCP Secret Manager: equivalent cloud-native options.

General best practices
- Never commit `.env` files or secrets. Add `.env*` to `.gitignore`.
- Keep an `env.example` or `env.sample` with variable names (no values).
- Use short-lived credentials when possible and enable rotation/auditing.
- Grant minimal access to services and CI runners (least privilege).
- Monitor and audit secret access; enable alerts for suspicious retrievals.
- Encrypt secrets at rest and in transit (managed by the secret store by default).
- Use secret-scanning tools in CI (GitHub Secret Scanning, truffleHog, Snyk, etc.).

Local development
- Use `.env.local` for per-developer secrets; **do not** commit it.
- Provide a `scripts/seed-dev-env.sh` or instructions to populate local secrets.
- Optionally use `direnv` or `dotenv` packages to load secrets safely.

CI: GitHub Actions (example)

1. Add secrets in GitHub repo settings → Secrets → Actions (e.g. `PROXY_JWT_SECRET`, `ANTHROPIC_API_KEY`, `SENTRY_DSN`, `REDIS_URL`).

2. Reference them in workflows (example snippet):

```yaml
env:
  NODE_ENV: production
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run tests
        run: npm test
      - name: Publish image (example)
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
        run: |
          echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
          docker build -t ghcr.io/${{ github.repository_owner }}/ai-interactive-model:${{ github.sha }} .
          docker push ghcr.io/${{ github.repository_owner }}/ai-interactive-model:${{ github.sha }}
```

Notes:
- Avoid echoing secrets to logs. Use `::add-mask::` or rely on built-in masking.
- For Docker build-time secrets, prefer BuildKit `--secret` or inject at runtime rather than embedding secrets in image layers.

Kubernetes (example)

1. Store secrets in your cloud provider or `kubectl create secret`:

```bash
kubectl create secret generic ai-secrets \
  --from-literal=PROXY_JWT_SECRET="$(openssl rand -hex 32)" \
  --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
```

2. Mount as environment variables in your Deployment manifest:

```yaml
env:
  - name: PROXY_JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: ai-secrets
        key: PROXY_JWT_SECRET
```

HashiCorp Vault (high-level)
- Use Vault policies to grant the app or CI role access to only required paths.
- Use the Kubernetes Auth method or Vault Agent to inject secrets into pods.
- Prefer dynamic secrets (databases, cloud credentials) where available.

Example: use Vault to store `ANTHROPIC_API_KEY`, then have your app fetch it at startup (or use Vault Agent to write it to a file and read from there).

Runtime considerations
- Validate required env vars at startup (we added `scripts/check-prod-env.js`).
- Do not print secrets in logs or error messages.
- Use OS-level secret mounting/API when possible (e.g., AWS credentials via IAM roles).

Emergency & rotation
- Have a documented rotation procedure in the runbook.
- Automate rotation where possible and test rollovers in staging.

Further reading
- HashiCorp Vault: https://www.vaultproject.io/
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- AWS Secrets Manager: https://aws.amazon.com/secrets-manager/

If you want, I can:
- Add a GitHub Actions snippet that injects secrets into the container image push step securely.
- Add a `scripts/rotate-secrets.md` runbook entry.

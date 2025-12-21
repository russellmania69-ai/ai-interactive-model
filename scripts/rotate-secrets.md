# Rotate Secrets Runbook

Purpose: quick, low-risk steps to rotate secrets used by the platform (CI, containers, and runtime). Use this for planned rotations and emergency key compromises.

Pre-checks
- Identify the secret name and all consumers (CI workflows, containers, services, k8s manifests).
- Notify stakeholders and schedule a maintenance window if rotation is not rolling.
- Ensure you have access to the secret store (GitHub Actions Secrets, Vault, AWS Secrets Manager, etc.).

Routine rotation (GitHub Actions Secrets)
1. Generate a new secret value (secure RNG):
   ```bash
   openssl rand -hex 32
   ```
2. Add the new value to GitHub repo → Settings → Secrets → Actions as `PROXY_JWT_SECRET_NEW` (or use the same name with overwrite via API).
3. Update CI workflow to temporarily reference the new secret key if staging/testing first.
4. Deploy to staging and smoke-test the service.
5. Once validated, replace the old secret name with the new value (or rotate alias) and revoke the previous secret.

Emergency rotation (compromise)
1. Create the new secret immediately in the secret store.
2. Update CI and runtime environments to reference the new secret.
3. Redeploy services (use rolling restarts to avoid downtime). Example Kubernetes rollout:
   ```bash
   kubectl set env deployment/my-app PROXY_JWT_SECRET=<new-value-or-ref>
   kubectl rollout restart deployment/my-app
   kubectl rollout status deployment/my-app
   ```
4. Revoke the compromised credential and rotate any downstream dependent keys (DB creds, API keys).
5. Re-run integration and smoke tests. Monitor logs and metrics for anomalies.

Vault-specific notes
- Use policies to allow the application role to read only required secrets.
- For dynamic secrets (databases), revoke leases via Vault API and allow clients to request new credentials.
- Use Vault Agent/sidecar or injection to avoid storing secrets on disk.

Verification
- Confirm health endpoints and authentication flows work.
- Run a smoke test user flow that requires the rotated secret (login, token exchange, API call).
- Check audit logs in the secret store for access patterns.

Rollback
- Keep the previous secret until new one is verified.
- If a rollback is needed, restore the previous secret value and redeploy.

Post-rotation
- Rotate any related tokens/keys that may have been derived from the rotated secret.
- Update the runbook with timestamps and notes about the rotation.

Automation tips
- Use the secret store API to script rotation and updates to deployment manifests.
- For Docker images, avoid baking secrets into images; inject at runtime.

Contact & escalation
- Pager/Slack: on-call team
- Owner: engineering security lead

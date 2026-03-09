# CI/CD & Release Management

> Continuous integration, build pipelines, GitOps deployment, progressive delivery, feature flag management, over-the-air updates, and testing infrastructure.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Ci/Cd Pipeline

### CI Orchestration

The platform that executes build, test, lint, security scan, and publish jobs on every pull request and merge to main. GitHub Actions is the standard, using cloud-hosted runners for the majority of jobs and self-hosted runners for tasks requiring on-premises network access (integration tests against on-prem services). Workload Identity Federation is used to authenticate GitHub Actions to Azure without storing long-lived credentials as GitHub Secrets.

### Mobile Build Service

Building a React Native app for distribution requires macOS (iOS) and Linux (Android) build environments, code signing credentials, and native dependency compilation. EAS Build (Expo Application Services) provides a managed cloud build fleet, eliminating the need to maintain a macOS rack for iOS builds. This is the single highest-impact infrastructure decision for reducing mobile CI/CD operational overhead.

### Code Signing

Apple requires all iOS apps and app updates to be signed with a Distribution Certificate and provisioning profile managed through the Apple Developer Program. Android requires a keystore. Fastlane Match stores encrypted certificates and profiles in a git repository backed by Azure Blob Storage. All CI agents access the same credential source, preventing certificate drift across developer machines and CI environments.

### Store Delivery

The automated submission of production builds to Apple App Store Connect (via Fastlane deliver) and Google Play Console (via Fastlane supply). Submission metadata — release notes, screenshots, review notes — is prepared in CI. AI-drafted release notes (GPT-4o-mini generating change summaries from PR titles) are staged for human review and approval before submission, reducing manual authoring toil.

### Static Analysis

Automated inspection of source code for bugs, security vulnerabilities, and quality violations without executing the code. SonarQube self-hosted on AKS provides SAST (Static Application Security Testing), code duplication detection, and tech debt tracking. Results are surfaced as PR annotations and gate conditions: critical and blocker severity findings prevent merge until resolved.

### Supply Chain Scanning

Automated security analysis of third-party dependencies and container images throughout the build pipeline. Socket.dev analyses npm package diffs for behavioural anomalies (new network calls, obfuscated code, install scripts). Trivy scans container images for CVEs. Cosign signs images with a hardware-backed key in Key Vault. CycloneDX generates a versioned SBOM per release, stored in Azure Blob immutable tier.

### Container Registry

The private registry from which Kubernetes pulls container images for deployment. Azure Container Registry (ACR) provides geo-replication, Cosign/Notation image signing verification, and native Trivy vulnerability scanning on push. Harbor OSS is used on-premises as a secondary mirror for air-gapped scenarios, using the OCI Distribution Spec for compatibility with ACR-signed images.

## Gitops & Deployment

### GitOps Engine

ArgoCD implements the GitOps model: the desired state of every Kubernetes workload is declared in Helm charts stored in a git repository, and ArgoCD continuously reconciles the live cluster state to match. No manual kubectl apply is permitted in production. All changes go through pull request review, merge, and ArgoCD sync. This provides a complete audit trail and deterministic rollback capability.

### Progressive Delivery

Argo Rollouts extends Kubernetes deployments with canary and blue-green release strategies gated by SLO queries. A typical mobile API release follows: 1% of traffic for 10 minutes → evaluate Prometheus SLO (error rate < 0.5%, p95 latency < 800ms) → 10% → 50% → 100%. If any SLO gate fails, Argo Rollouts automatically reverts to the previous version without human intervention.

### Infrastructure as Code

All cloud and on-premises infrastructure is defined as code and version-controlled in the repository under `/infra`. OpenTofu (the OSS fork of Terraform under the MPL 2.0 licence) manages Azure resources and on-prem Kubernetes configurations. Azure Bicep provides fine-grain management of Azure PaaS services where OpenTofu's Azure provider lacks full feature parity. Zero infrastructure is created through the Azure Portal.

### IaC Drift Detection

A nightly GitHub Actions pipeline runs Driftctl against the live Azure subscription and on-premises infrastructure state, comparing actual resource configuration against the OpenTofu state file. Any deviation — a manually added inbound NSG rule, a scaled-up VM SKU — is reported as a diff and posted to Slack. Unresolved drift older than 48 hours triggers a P2 incident ticket.

## Feature Flags & Ota

### Feature Flag Service

Unleash (OSS) provides server-side feature flag evaluation with a React Native client SDK for mobile. Flags control feature availability by user segment, device type, app version, and percentage rollout, allowing gradual feature exposure entirely independent of app releases. Unleash is self-hosted on Azure Container Apps for serverless scaling, ensuring flag evaluation latency does not degrade under traffic spikes.

### OTA Update Delivery

EAS Update delivers JavaScript bundle updates directly to devices without requiring a new App Store submission, as permitted by Apple and Google for JavaScript-only changes. Update channels (production, beta, internal) allow staged rollout to subsets of users. Adoption rate — the percentage of active devices on the latest update within 48 hours — is a tracked SLO alongside crash-free sessions.

### Staged Rollout (Mobile)

Production releases use a coordinated three-track rollout: Play Console staged rollout (1%→25%→100% over 72 hours) and TestFlight phased release for native binary changes; EAS Update channels for JS-only changes; Argo Rollouts canary for backend API changes. The three tracks are monitored together on a single Grafana dashboard to correlate regressions across layers.

## Testing

### Unit / Component Testing

Jest with React Native Testing Library validates individual functions, hooks, and UI components in isolation. Tests run on every pull request against all affected Nx packages. Coverage thresholds are enforced per package: Domain layer requires ≥90% line coverage, Infrastructure layer ≥80%, Presentation layer ≥70%. Coverage regressions block merge.

### E2E Testing

Detox drives real iOS and Android device interactions through BrowserStack App Automate, testing complete user journeys — login, deep link navigation, offline form submission, biometric auth — against a staging environment. E2E tests run on every merge to main and nightly against production, providing regression coverage at the integration boundary between the React Native app and the live backend.

### Load Testing

Azure Load Testing (managed k6) simulates mobile API traffic at production-equivalent scale before each major release. Tests model realistic mobile usage patterns: bursty request spikes, parallel WebSocket connections, and staggered OTA update polling. Performance budgets (p95 API latency < 800ms at 10× peak concurrent users) are enforced as CI gate conditions.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

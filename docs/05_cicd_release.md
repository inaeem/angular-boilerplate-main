# CI/CD & Release Management

> Continuous integration, build pipelines, GitOps deployment, progressive delivery, feature flags, OTA updates, and testing infrastructure.

---

## Deployment Model Key

| Symbol | Model |
|:---:|---|
| 🏢 | **On-Premises** — self-managed infrastructure within your datacentre |
| ☁️ | **Cloud** — Azure-native managed services + OSS application layer |
| 🔀 | **Hybrid** — cloud for internet-facing workloads, on-prem for regulated/legacy |

| Signal | Meaning |
|:---:|---|
| ✅ | Advantage or recommended approach for this dimension |
| ⚠️ | Neutral, trade-off, or requires additional context |
| ❌ | Disadvantage, risk, or significant operational burden |

---

## CI/CD Pipeline

_The pipeline that builds, scans, signs, and publishes every code change — from PR lint through store submission._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **CI Orchestration** | Platform executing build, test, lint, security scan, and publish jobs on every PR and merge. | ⚠️ GitHub Actions (self-hosted runners on-prem VMs) or GitLab CI (self-managed) | ✅ GitHub Actions (cloud runners) with azure/login via Workload Identity Federation | ✅ GitHub Actions with cloud runners (EAS Build, store submit) + self-hosted runners (on-prem integration tests) |
| **Mobile Build Service** | Building React Native apps requires macOS (iOS) and Linux (Android) environments. EAS Build eliminates macOS rack maintenance entirely. | ⚠️ EAS Build (cloud-based) — still requires internet for signing; OR self-hosted macOS rack | ✅ EAS Build (Expo managed) — eliminates macOS build agent maintenance entirely | ✅ EAS Build (cloud) for all mobile builds; on-prem only hosts integration test suites |
| **Code Signing** | Managing Apple Distribution Certificates and Android keystores. Fastlane Match stores encrypted certs in Azure Blob Storage. | ⚠️ Fastlane Match backed by self-hosted GitLab or MinIO cert store | ✅ Fastlane Match backed by Azure Blob Storage (encrypted cert repo) | ✅ Fastlane Match backed by Azure Blob Storage — same regardless of app backend |
| **Store Delivery** | Automated submission to Apple App Store Connect (Fastlane deliver) and Google Play Console (Fastlane supply) with AI-drafted release notes. | ✅ Fastlane deliver (iOS) + Fastlane supply (Android) — tools are backend-agnostic | ✅ Fastlane deliver + supply; release notes AI-drafted (GPT-4o-mini) + human-approved | ✅ Same Fastlane pipeline; AI release note drafting in cloud CI regardless of backend |
| **Static Analysis** | Automated source code inspection for bugs, security vulnerabilities, and quality violations without execution. | ⚠️ SonarQube self-managed on on-prem K8s; full control of rules and data | ✅ SonarQube self-managed on AKS (OSS) or SonarCloud SaaS — both supported | ✅ SonarQube on AKS cloud zone; code never needs to leave the cloud CI boundary |
| **Supply Chain Scanning** | Socket.dev (behavioural npm analysis) + Trivy (CVE scanning) + Cosign (image signing) + CycloneDX (SBOM per release). | ✅ Socket.dev + Trivy + Cosign + CycloneDX — OSS tools; on-prem CI pipeline | ✅ Same tools in GitHub Actions cloud runners; ACR for signed image storage | ✅ Same tools; ACR for cloud images; on-prem Harbor registry for on-prem service images |
| **Container Registry** | Private registry from which Kubernetes pulls container images. ACR provides geo-replication, Cosign support, and native Trivy scanning. | ⚠️ Harbor (OSS) self-managed on-prem; S3-compatible replication; Cosign signing | ✅ Azure Container Registry (ACR) — managed; Cosign/Notation support; Trivy scanning | ✅ ACR (cloud) for all images; on-prem Harbor as secondary mirror for air-gapped needs |

## GitOps & Deployment

_Declarative deployment through GitOps, progressive delivery with SLO-gated canary releases, and infrastructure as code with drift detection._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **GitOps Engine** | ArgoCD continuously reconciling live cluster state to Git-declared Helm chart state. No manual kubectl apply in production. | ✅ ArgoCD (OSS) self-managed on on-prem K8s; full control; ops overhead | ✅ ArgoCD (OSS) on AKS — same tool; Azure-managed K8s reduces ops burden | ✅ ArgoCD in cloud zone watches cloud Helm charts; on-prem ArgoCD for on-prem services |
| **Progressive Delivery** | Argo Rollouts canary strategy gated by Prometheus SLO queries: 1%→10%→50%→100% with auto-rollback on gate failure. | ✅ Argo Rollouts (OSS) on on-prem K8s; Prometheus queries for SLO gates | ✅ Argo Rollouts on AKS; queries Azure Managed Prometheus for SLO-gated rollouts | ⚠️ Argo Rollouts cloud zone (AKS); on-prem uses standard K8s rolling updates |
| **Infrastructure as Code** | All infrastructure defined as code in /infra. OpenTofu (OSS Terraform fork, MPL 2.0) + Azure Bicep. Zero Portal-created resources. | ✅ OpenTofu (OSS fork of Terraform) for on-prem VMware/Proxmox + K8s resources | ✅ OpenTofu for Azure resources + Azure Bicep for PaaS fine-grain config | ⚠️ OpenTofu manages both Azure and on-prem resources; separate state files per target |
| **IaC Drift Detection** | Driftctl nightly pipeline comparing live resource configuration against OpenTofu state file. Deviations posted to Slack. | ✅ Driftctl (OSS) against on-prem infra state; nightly pipeline; Slack reports | ✅ Driftctl against Azure subscription; nightly GitHub Actions; Slack/Teams report | ⚠️ Driftctl runs against both Azure and on-prem; dual state comparison per night |

## Feature Flags & OTA

_Runtime feature control, over-the-air bundle delivery, and coordinated staged rollout across native binary, JS bundle, and backend API changes simultaneously._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Feature Flag Service** | Unleash (OSS) self-hosted on Azure Container Apps providing per-user, per-device, per-version flag evaluation independent of app releases. | ⚠️ Unleash (OSS) self-managed on on-prem K8s; full data sovereignty; ops overhead | ✅ Unleash (OSS) on Azure Container Apps — serverless K8s; minimal ops overhead | ✅ Unleash on Azure Container Apps for cloud; same Unleash instance serves both zones |
| **OTA Update Delivery** | EAS Update delivers JS bundle updates directly to devices without App Store review. Adoption rate tracked as SLO. | ⚠️ EAS Update (cloud) — still uses Expo CDN; OR self-hosted update server on-prem | ✅ EAS Update (Expo managed) + Azure Blob CDN for JS bundle storage | ✅ EAS Update (cloud) for consumer apps; self-hosted update server for internal apps |
| **Staged Rollout (Mobile)** | Three-track coordinated rollout: Play Console staged rollout + TestFlight + EAS Update channels + Argo Rollouts backend canary. | ⚠️ Play Console staged rollout + TestFlight; Argo Rollouts for backend canary | ✅ Play Console + TestFlight + Argo Rollouts + EAS Update channels — all coordinated | ✅ Same toolchain; backend canary (Argo Rollouts) respects both cloud and on-prem legs |

## Testing

_Unit, component, end-to-end, and load testing infrastructure covering both mobile app behaviour and backend API performance._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Unit / Component Testing** | Jest + React Native Testing Library on every PR against all affected Nx packages. Coverage thresholds enforced per layer. | ✅ Jest + React Native Testing Library — OSS; runs in any CI environment | ✅ Jest + RNTL in GitHub Actions cloud runners — faster CI minutes | ✅ Same test tools; on-prem CI runners can run unit tests if internet-restricted |
| **E2E Testing** | Detox driving real iOS and Android device interactions on BrowserStack App Automate, testing complete user journeys against staging. | ⚠️ Detox on self-hosted device farm or BrowserStack — both options available | ✅ Detox on BrowserStack App Automate (SaaS); Azure DevOps test plans integration | ✅ Detox on BrowserStack — cloud SaaS; no dependency on on-prem infra for device testing |
| **Load Testing** | Azure Load Testing (managed k6) simulating mobile API traffic at production-equivalent scale before each major release. p95 budget enforced as CI gate. | ✅ k6 (OSS) against on-prem BFF; run from CI self-hosted runners; no SaaS cost | ✅ Azure Load Testing (managed k6) — runs within Azure tenant; no egress charges | ⚠️ Azure Load Testing for cloud API surface; k6 self-hosted for on-prem API surface |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

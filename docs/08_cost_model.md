# Cost Model

> Capital vs operating expenditure trade-offs, headcount costs, cost optimisation levers, and 3-year total cost of ownership projections.

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

## Capital vs Operating Expenditure

_The fundamental financial model governing how infrastructure costs appear on the balance sheet and how they scale with growth._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Infrastructure Cost Model** | CapEx (hardware, space, power) vs OpEx (consumption billing). Hybrid requires managing both budget types simultaneously. | ⚠️ CapEx-dominant: servers, racks, networking, cooling, power, datacenter lease | ✅ OpEx-dominant: pay-as-you-go; reserved instances; no hardware ownership | ⚠️ Split: CapEx for on-prem portion; OpEx for cloud portion; hybrid budget planning required |
| **Hardware Investment** | Enterprise mobile backend at scale (50K+ MAU) requires $200K–$2M+ initial CapEx plus a 3–5 year refresh. Cloud converts this to zero upfront. | ❌ High upfront CapEx ($200K–$2M+ for enterprise mobile backend); 3–5 yr refresh | ✅ Zero hardware CapEx; no refresh cycles; infrastructure cost is pure OpEx | ⚠️ Reduced CapEx (smaller on-prem footprint); still requires hardware refresh for on-prem |
| **Idle Resource Cost** | Servers run 24/7 regardless of utilisation. Cloud scale-to-zero (KEDA, Container Apps) eliminates idle waste in dev/staging. Spot nodes provide 60–90% savings. | ❌ Servers run 24/7 regardless of load; significant waste in low-traffic periods | ✅ Pay-per-use; scale to zero for dev/staging; spot nodes reduce costs 60–90% | ⚠️ On-prem portion runs 24/7; cloud portion scales to zero — partial waste reduction |
| **Licensing Cost** | OSS-first architecture minimises licensing spend. Unavoidable commercial: GuardSquare, Approov, OneTrust. GitHub Copilot is the sole AI licensing cost. | ✅ OSS-only possible; avoid commercial licenses entirely; Sentry, Unleash all self-hosted | ⚠️ Azure managed services included in OpEx; GuardSquare + Approov commercial still required | ⚠️ Commercial licenses same (GuardSquare, Approov, OneTrust); Azure OpEx + on-prem CapEx |

## Operational Cost

_Human capital required to operate the platform — the largest cost line in most enterprise mobile programmes._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **DevOps / Platform Engineering Headcount** | On-prem requires 6–10 FTEs managing hardware lifecycle. Cloud reduces to 3–5 FTEs focused on application architecture and security posture. | ❌ Highest: requires dedicated infra team (6–10 FTEs for enterprise-scale on-prem) | ✅ Medium: platform team (3–5 FTEs) — Azure manages infra; team focuses on app arch | ⚠️ Medium-High: hybrid model requires expertise in both Azure and on-prem (4–7 FTEs) |
| **DBA Headcount** | Azure PostgreSQL handles patching, backup, and HA automatically, reducing DBA involvement to schema design and query optimisation. | ❌ High: dedicated DBA required for PostgreSQL HA, backup, replication, patching | ✅ Low: Azure managed PostgreSQL handles patching, backup, HA automatically | ⚠️ Medium: on-prem PostgreSQL still needs DBA; Azure PostgreSQL is self-managing |
| **Security Operations Cost** | Defender for Cloud, Azure Policy, and managed WAF rules automate majority of posture management, reducing reactive SecOps toil. | ❌ High: SOC team, patching cadence, vulnerability management all in-house | ✅ Medium: Defender for Cloud + Azure Policy automates most posture management | ⚠️ Medium-High: SecOps covers both Azure zone (Defender) and on-prem zone (Wazuh/OPA) |
| **Mobile Build Infrastructure Cost** | macOS rack for iOS builds costs $15K+/yr in hardware + hosting. EAS Build eliminates this entirely at the cost of per-build pricing. | ❌ High: macOS rack for iOS builds ($15K+/yr hardware + hosting); Android Linux agents | ✅ Low: EAS Build (Expo managed) eliminates macOS agent maintenance entirely | ✅ Low: EAS Build (cloud) for all builds regardless of backend deployment model |

## Cost Optimization Levers

_Mechanisms to reduce infrastructure spend without impacting reliability: autoscaling, reserved capacity, OSS-first observability, OTA delivery, and relative TCO._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Autoscaling / Scale-to-Zero** | KEDA enables Kubernetes pods to scale to zero when trigger metrics reach zero. Dev/staging environments cost nothing overnight. | ❌ Manual scaling only; no auto scale-down; full capacity provisioned at all times | ✅ KEDA scale-to-zero; cluster autoscaler; Container Apps serverless billing model | ⚠️ KEDA in cloud zone (scale-to-zero); on-prem zone always-on — partial optimization |
| **Reserved Capacity Discounts** | Azure Reserved Instances (1yr/3yr) provide 35–55% discount on PostgreSQL, Redis, and AKS nodes versus pay-as-you-go pricing. | ❌ CapEx hardware already committed; no additional reservation discount available | ✅ Azure Reserved Instances (1yr/3yr): 35–55% discount on PostgreSQL, Redis, AKS nodes | ⚠️ Reserved Instances for cloud portion; on-prem hardware amortized separately |
| **Per-MAU Cost (Observability)** | Self-hosted Sentry, Unleash, and Grafana convert variable per-MAU SaaS costs to fixed infrastructure cost — typically $30K–$80K/yr avoided at 100K MAU. | ✅ Self-hosted Sentry, Unleash, Grafana — fixed infrastructure cost; no per-MAU fee | ✅ Self-hosted Sentry + Unleash on AKS — fixed cost; significantly cheaper than SaaS at scale | ✅ Same OSS-first approach; self-hosted tools run on cloud AKS — no per-MAU fee |
| **OTA vs Store Build Cost** | Shifting 60–70% of releases to OTA-only updates reduces EAS Build credit consumption and eliminates App Store review uncertainty. | ✅ EAS OTA for JS changes; still cloud-dependent for OTA delivery CDN | ✅ EAS OTA eliminates rebuild cost for JS-only changes; Azure Blob CDN for bundles | ✅ EAS OTA for all JS changes regardless of backend — cloud CDN always used for OTA |
| **3-Year TCO Estimate (Relative)** | Cloud TCO is typically 20–40% lower than equivalent on-prem when total cost (hardware, software, people, space, power) is compared at mobile scale. | ❌ Highest TCO: CapEx + OpEx + headcount; industry avg 40–60% higher than cloud | ✅ Lowest TCO at scale: OpEx + reduced headcount; unit economics improve with growth | ⚠️ Middle TCO: cloud savings partially offset by on-prem CapEx + dual-ops headcount |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

# Decision Guide

> Strategic advantages, risk assessment, and a structured framework for choosing between deployment models for the 3–5 year architecture horizon.

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

## Strategic Advantages

_Dimensions where one deployment model holds a meaningful advantage over the others for enterprise mobile platform contexts._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Data Sovereignty** | Who has physical and legal control over data at rest. On-prem strongest; Azure enforces residency contractually; hybrid enables tiering by classification. | ✅ ✔ Complete: all data physically within your controlled premises | ⚠️ ⚠ Regional: data residency enforced by Azure region; CSP has logical access | ✅ ✔ Tiered: highest-sensitivity data on-prem; standard data in cloud — best of both |
| **Vendor Independence** | Degree to which the architecture can be migrated away from a specific vendor without rebuilding. OSS-first application layer mitigates Azure lock-in. | ✅ ✔ Maximum: no dependency on any cloud vendor; pure OSS possible | ⚠️ ⚠ Moderate: Azure-native services create switching cost; OTel + OSS reduces lock-in | ✅ ✔ Strong: hybrid keeps portability options open; on-prem leg provides cloud exit |
| **Operational Control** | Granularity of control over every layer of the stack. Cloud shared-responsibility trades fine-grained control for dramatically reduced operational toil. | ✅ ✔ Maximum: every layer under direct control; no shared-responsibility gaps | ⚠️ ⚠ Shared: Microsoft manages infra; you manage app + config — faster but less control | ✅ ✔ Granular: full control on-prem; shared model for cloud — control where it matters |
| **Regulatory Fit (Highly Regulated)** | Specific regulations (FedRAMP High, IL5/IL6, HIPAA air-gap, FINRA) may require on-prem or sovereign cloud. Hybrid satisfies mixed-regulation environments. | ✅ ✔ Strongest for air-gapped / national security / government classified | ✅ ⚠ Strong with HIPAA Blueprint + BAA; some regulators still require on-prem | ✅ ✔ Best fit for mixed-regulation: regulated data on-prem; analytics in cloud |
| **Time to Market** | Calendar time from architectural decision to first production deployment. Cloud provisioning in minutes vs 8–26 week hardware procurement cycle. | ❌ ✖ Slowest: hardware procurement 8–26 weeks; infra setup before first deploy | ✅ ✔ Fastest: provision in minutes; first deployment same day as architecture decision | ⚠️ ⚠ Medium: cloud leg fast; on-prem leg still has procurement and setup lead time |
| **Innovation Velocity** | Speed at which the platform team can adopt new capabilities. Cloud services are immediately available; on-prem requires self-hosting new OSS releases. | ⚠️ ⚠ Moderate: new Azure services unavailable; must build or self-host equivalents | ✅ ✔ Highest: immediate access to new Azure managed services and features | ✅ ✔ High for cloud leg; moderate for on-prem leg — new features cloud-first |
| **Mobile Developer Experience** | Day-to-day engineer experience: cloud CI runners, EAS managed builds, fast feedback loops vs self-hosted runner maintenance. | ⚠️ ⚠ Similar tooling; slower CI due to self-hosted runners; more infra debugging | ✅ ✔ Best DX: cloud runners, EAS managed builds, fast feedback loops | ✅ ✔ Cloud CI for mobile builds; on-prem only for integration tests — good DX |

## Strategic Risks

_Risks that each deployment model introduces to the 3–5 year platform roadmap. Understanding these is essential before committing to a model._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Single Point of Failure Risk** | Probability and impact of a single infrastructure failure taking down the mobile platform. | ❌ High: DC-level failure; no geographic redundancy without second DC investment | ✅ Low: AZs + multi-region Front Door; Azure SLA 99.9–99.99% per service | ✅ Low for cloud zone (AZs); medium for on-prem zone — failure modes are independent |
| **Vendor Lock-in Risk** | Risk that dependence on Azure-native services prevents migration without prohibitive cost. Mitigated by OTel, OSS client libraries, OpenTofu, and PostgreSQL. | ✅ Low: OSS-only stack; fully portable; no vendor dependency | ⚠️ Medium: Azure-managed services have switching cost; mitigated by OSS-first principle | ⚠️ Low-Medium: cloud zone has Azure lock-in; on-prem leg provides exit lever |
| **Talent Availability Risk** | Difficulty hiring engineers with the required skills. On-prem K8s/VMware skills increasingly scarce. Hybrid requires both Azure and on-prem expertise — rare. | ❌ High: specialised on-prem K8s/VMware skills increasingly scarce; hiring difficult | ⚠️ Medium: Azure skills widely available; React Native + cloud skills abundant | ❌ High: requires talent proficient in both Azure and on-prem — rare combined skillset |
| **Operational Toil Risk** | Accumulation of repetitive manual work — cert renewals, K8s node upgrades, hardware replacements — consuming capacity that should go to product features. | ❌ Highest: patching, cert rotation, hardware failures all manual; burnout risk | ✅ Lowest: Azure manages infra; team focuses on application-level concerns | ❌ High: double the operational surface — Azure ops + on-prem ops simultaneously |
| **Cost Overrun Risk** | Risk that actual infrastructure costs significantly exceed budget. Cloud can spike from runaway autoscaling; on-prem over-provisions at purchase time. | ⚠️ Medium: CapEx committed upfront; under-utilisation risk; no cost elasticity | ⚠️ Medium: OpEx can spike with traffic; mitigated by autoscaling + cost anomaly alerts | ❌ High: dual cost model (CapEx + OpEx) harder to predict; over-provisioning risk on-prem |
| **Security Patch Latency Risk** | Window of exposure between CVE disclosure and patch applied. Azure patches managed infrastructure automatically, often before public disclosure. | ❌ High: all patches applied manually; window between disclosure and patch is owned | ✅ Low: Azure patches managed infrastructure automatically; zero-day response fast | ⚠️ Medium: Azure zone patched automatically; on-prem zone still requires manual patching |

## Decision Guide — When to Choose Each

_Structured guidance for the architecture decision based on regulatory requirements, team size, existing investments, and strategic priorities._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Recommended When…** | Primary conditions that favour each deployment model based on regulatory, operational, and strategic factors. | ⚠️ Air-gapped requirement / classified govt / strict data localisation with no cloud exemption / existing DC investment < 2yr old | ✅ Greenfield enterprise mobile / startup scaling / global user base / no air-gap mandate / maximise engineering velocity | ✅ Mixed regulatory environment / legacy on-prem systems requiring mobile access / phased cloud migration / tiered data sovereignty needs |
| **Not Recommended When…** | Conditions under which the deployment model is a poor fit and an alternative should be strongly considered. | ❌ Global mobile user base / startup / rapid scale needed / small platform team (<3 FTEs) | ❌ Classified / air-gapped / jurisdiction prohibits data leaving sovereign territory | ⚠️ Simple use case / very small team (<2 FTEs) — complexity overhead rarely justified |
| **3–5 Year Sustainability Assessment** | Long-term viability of each model given industry trends, hardware refresh cycles, talent market shifts, and Azure roadmap alignment. | ⚠️ Moderate: hardware refresh at yr 3–4; talent risk increases; cloud-first industry trend works against on-prem long-term | ✅ High: platform stays current automatically; Azure roadmap aligned with enterprise mobile needs; OSS-first reduces lock-in | ✅ High if well-governed: complexity must be actively managed; justified by clear regulatory or integration requirements |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

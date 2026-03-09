# Cost Model

> Capital vs operating expenditure trade-offs, operational headcount costs, cost optimisation levers, and total cost of ownership projections across deployment models.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Capital Vs Operating Expenditure

### Infrastructure Cost Model

On-premises is CapEx-dominant: hardware, racks, networking equipment, datacentre space, power, and cooling are purchased or leased upfront, depreciated over 3–5 years, and require a refresh cycle. Cloud is OpEx-dominant: all infrastructure costs appear as monthly consumption charges with no upfront commitment required (pay-as-you-go) or reduced committed rates (reserved instances). Hybrid produces a split budget requiring CapEx planning for the on-prem portion and OpEx forecasting for the cloud portion.

### Hardware Investment

An enterprise mobile backend at scale (50K+ MAU) requires substantial compute: a minimum of 3 AKS-equivalent worker nodes, 2 PostgreSQL HA nodes, 3 Redis Sentinel nodes, and monitoring infrastructure. At current hardware pricing this represents $200K–$2M+ in initial capital depending on redundancy requirements, plus a comparable refresh investment every 3–5 years. Cloud converts this to zero upfront cost with equivalent capability provisioned on demand.

### Idle Resource Cost

On-premises hardware runs at full power draw and rack space cost 24/7 regardless of actual utilisation. Development and staging environments that are idle 16 hours per day represent pure waste. Cloud scale-to-zero (KEDA, Azure Container Apps) eliminates this waste: development clusters cost nothing overnight. Spot node pools for non-critical batch workloads provide 60–90% cost reduction versus on-demand. Hybrid retains idle waste on the on-prem portion.

### Licensing Cost

An OSS-first architecture minimises licensing spend: PostgreSQL, Redis, Prometheus, Grafana, ArgoCD, and Sentry are all open-source under permissive licences. Unavoidable commercial costs include GuardSquare (DexGuard/iXGuard), Approov (device attestation), OneTrust (consent management), and optionally Chromatic (visual regression). GitHub Copilot (Teams) is the sole AI licensing cost. Azure managed services are billed as consumption OpEx rather than per-seat licence fees.

## Operational Cost

### DevOps / Platform Engineering Headcount

Platform engineering labour is typically the largest cost line in an enterprise mobile programme. On-premises requires a larger platform team to manage hardware lifecycle, K8s upgrades, network configuration, and custom monitoring — typically 6–10 FTEs at senior engineer rates. Cloud reduces this to 3–5 FTEs focused on application architecture, observability, and security posture rather than infrastructure operations. Hybrid sits between but closer to the higher end due to dual-system expertise requirements.

### DBA Headcount

PostgreSQL HA, replication, vacuuming, index management, major version upgrades, and performance tuning require dedicated DBA expertise on-premises. Azure PostgreSQL Flexible Server handles patching, backup, and zone-redundant failover automatically, significantly reducing DBA involvement to schema design review, query optimisation, and capacity planning. At enterprise scale this represents a 0.5–1 FTE reduction versus an equivalent on-premises deployment.

### Security Operations Cost

Operating a security posture across a complex on-premises mobile backend requires dedicated SecOps investment: vulnerability scanning, patch scheduling, WAF rule tuning, certificate management, and penetration test remediation. Defender for Cloud, Azure Policy, and managed WAF rules automate the majority of ongoing posture management in the cloud model, reducing reactive SecOps toil and allowing the security function to focus on architecture review and threat modelling.

### Mobile Build Infrastructure Cost

Building iOS apps requires macOS hardware. A self-hosted iOS CI fleet requires Apple Mac Minis or Mac Pros in a rack, ongoing macOS licensing, Xcode version management, and code signing certificate maintenance. At 2024 pricing, a 4-agent macOS rack costs $15K–$20K per year in hardware amortisation plus hosting. EAS Build eliminates this entirely: Expo maintains the macOS fleet, and builds are triggered via API with per-build pricing.

## Cost Optimization Levers

### Autoscaling / Scale-to-Zero

KEDA enables Kubernetes pods to scale to zero replicas when a trigger metric (Service Bus queue depth, HTTP request rate, Prometheus query result) reaches zero. Combined with the AKS Cluster Autoscaler removing idle nodes, development and staging environments can run at effectively zero cost overnight and on weekends. This is not achievable on-premises without deprovisioning VMs manually — which creates a significant restore time before morning stand-up.

### Reserved Capacity Discounts

Azure Reserved Instances allow pre-committing to 1 or 3 years of specific VM SKUs, PostgreSQL compute tiers, and Redis cache sizes in exchange for discounts of 35–55% versus pay-as-you-go pricing. For production workloads with stable baseline capacity (PostgreSQL flexible server, Redis cache, AKS system node pool), reservation purchases are a straightforward cost reduction with minimal risk given the 3–5 year architecture horizon.

### Per-MAU Cost (Observability)

Commercial observability SaaS platforms (Datadog, New Relic, Dynatrace) charge per host per month or per data ingested, with costs scaling rapidly past 50K MAU. The OSS-first approach — Sentry self-hosted, Unleash self-hosted, Grafana Managed — converts this to a fixed infrastructure cost (3–4 AKS pods) regardless of user count. At 100K MAU this typically represents $30K–$80K per year in avoided SaaS spend.

### OTA vs Store Build Cost

App Store review cycles (1–3 days) and the full native build pipeline represent significant time and compute cost per release. EAS Update allows JavaScript-only changes to be delivered as OTA updates in minutes without a native build or store review. For a team releasing weekly, shifting 60–70% of releases to OTA-only updates reduces EAS Build credit consumption, eliminates review uncertainty, and compresses the time from code merge to user availability.

### 3-Year TCO Estimate (Relative)

Industry benchmarks from Gartner and Forrester consistently show cloud TCO 20–40% lower than equivalent on-premises for enterprise workloads at mobile scale when total cost (hardware, software, people, space, power) is compared. The hybrid model typically sits 10–20% higher than pure cloud due to the dual operational overhead, but is justified when regulatory or integration requirements mandate on-premises presence. All three models benefit equally from the OSS-first observability and build cost reduction strategies.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

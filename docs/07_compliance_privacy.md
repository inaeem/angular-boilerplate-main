# Compliance & Privacy

> Regulatory frameworks, governance tooling, privacy architecture, and audit controls for enterprise mobile platforms operating across multiple jurisdictions.

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

## Regulatory Compliance

_Key regulatory frameworks applicable to enterprise mobile platforms. Each framework imposes specific technical controls that must be implemented and evidenced._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **GDPR / CCPA** | Requires lawful processing basis, consent management, data subject rights (access, erasure, portability), and breach notification within 72 hours. | ✅ OneTrust SDK (mobile) + custom erasure APIs; full data control on-prem | ✅ OneTrust SDK + Microsoft Purview data discovery; Entra Graph API for erasure | ✅ OneTrust SDK; Purview discovers cloud data; custom erasure covers on-prem data stores |
| **HIPAA** | Governs Protected Health Information (PHI) in US healthcare. Requires BAA with all vendors, encryption, audit trails, and minimum-necessary access. | ⚠️ Custom HIPAA controls; BAA with self-managed infra vendors; full ops burden | ✅ Azure HIPAA Blueprint + Microsoft BAA + Key Vault HSM; Defender for Cloud scoring | ⚠️ Microsoft BAA covers Azure zone; on-prem zone needs separate BAA and HIPAA controls |
| **SOC 2 Type II** | Audits operating effectiveness of security, availability, and confidentiality controls over a minimum 6-month observation period. | ⚠️ Drata / Vanta integration with self-hosted tooling; evidence collection manual | ✅ Drata integrates natively with Azure — continuous SOC 2 control evidence collection | ⚠️ Drata integrates Azure controls; on-prem controls require manual evidence collection |
| **PCI-DSS** | Applies if the app processes or transmits cardholder data. Architecture minimises PCI scope by using Stripe/Adyen SDKs — PAN never touches application servers. | ⚠️ Custom PCI scope; never touch PAN — Stripe/Adyen SDK; PCI scope limited | ✅ Azure PCI Blueprint + Stripe/Adyen SDK; no PAN in Azure; PCI assessment supported | ✅ Stripe/Adyen SDK handles PAN regardless; Azure PCI Blueprint for cloud segment |
| **ISO 27001** | International ISMS certification. Azure provides ISO 27001 workbook with pre-mapped controls for continuous compliance scoring. | ⚠️ Custom ISMS; Azure Security Center excluded; full internal audit burden | ✅ Azure Security Center + ISO 27001 workbook; continuous compliance scoring | ⚠️ Azure ISO 27001 coverage for cloud; on-prem resources require separate ISMS scope |
| **Data Residency / Sovereignty** | Legal requirement that data be stored and processed within a specific geographic jurisdiction. | ✅ Complete data sovereignty — all data on-premises within jurisdiction | ✅ Azure region selection enforces data residency; 60+ regions globally available | ✅ On-prem for highest-sovereignty data; cloud zone for non-sensitive — tiered residency |
| **WCAG 2.2 AA Accessibility** | Accessibility compliance baseline for enterprise mobile apps. Automated CI gates on every PR using axe-core and react-native-accessibility-engine. | ✅ axe-core + react-native-accessibility-engine in CI — backend-agnostic | ✅ axe-core + react-native-accessibility-engine — same; runs in cloud CI runners | ✅ Same accessibility tooling; CI runner location does not affect accessibility compliance |
| **EU AI Act (if AI ops used)** | AI scoped exclusively to developer tooling and operational aids — all low-risk or out-of-scope. No AI makes autonomous decisions affecting end-users. | ✅ No AI in product; AI ops tools (GitHub Copilot) are developer-side only | ✅ AI strictly scoped to code assist + ops (GitHub Copilot, Copilot for Azure) | ✅ Same AI boundary — AI ops tools in cloud CI; no AI in product regardless of deployment |

## Governance Tooling

_Policy-as-code enforcement, continuous security posture scoring, data cataloguing, and immutable audit log infrastructure._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Policy as Code** | Azure Policy enforces configuration compliance continuously across the subscription. OPA/Gatekeeper provides equivalent Kubernetes admission control on-prem. | ⚠️ Open Policy Agent (OPA/Gatekeeper) on on-prem K8s; custom Rego policies | ✅ Azure Policy — enforces config compliance across entire Azure subscription; no-code | ⚠️ Azure Policy for cloud resources; OPA/Gatekeeper for on-prem K8s; dual policy engines |
| **Security Posture Scoring** | Continuous Secure Score tracked as a platform KPI, mapped to CIS Benchmarks, NIST SP 800-53, and ISO 27001. | ⚠️ OpenSCAP for node hardening; manual periodic assessments; no continuous score | ✅ Microsoft Defender for Cloud — continuous score against CIS, NIST, ISO 27001 | ⚠️ Defender for Cloud scores Azure zone; OpenSCAP + Wazuh for on-prem zone; dual scores |
| **Data Governance / Catalog** | Microsoft Purview auto-discovers and classifies sensitive data across all Azure services, building lineage graphs for GDPR subject access responses. | ⚠️ Apache Atlas (OSS) or custom; no native integration with code annotations | ✅ Microsoft Purview — auto-discovers sensitive data across all Azure services | ⚠️ Purview covers cloud data; Atlas or manual catalog for on-prem data — dual governance |
| **Audit Log Immutability** | All privileged actions written to Azure Blob WORM immutable storage — legally admissible evidence for SOC 2 Type II and HIPAA. | ⚠️ MinIO WORM + hash-chained OTel events; custom tooling; ops intensive | ✅ Azure Blob immutable storage (WORM) — legally admissible; automated lifecycle | ✅ Azure Blob WORM for cloud audit logs; MinIO WORM for on-prem logs — both immutable |
| **SBOM Management** | CycloneDX SBOMs generated per build, stored in Azure Blob immutable tier with release version tag for CVE impact assessment. | ✅ CycloneDX (OSS) generated per build; stored in MinIO WORM on-prem | ✅ CycloneDX per build; stored in Azure Blob immutable tier; per-release versioning | ✅ CycloneDX same; Azure Blob immutable for all SBOMs regardless of on-prem/cloud |

## Privacy Architecture

_Technical controls implementing Privacy by Design: consent management, PII detection and redaction, Apple Privacy Manifest compliance, and Right to Erasure workflow._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Consent Management (Mobile)** | OneTrust SDK gates all analytics events on mobile. Consent ledger in PostgreSQL. No analytics SDK initialises until consent is granted. | ✅ OneTrust SDK gates all analytics events; consent ledger in on-prem PostgreSQL | ✅ OneTrust SDK gates analytics; consent ledger in Azure PostgreSQL; Purview integration | ✅ OneTrust SDK same; consent ledger in cloud PostgreSQL; on-prem apps check via API |
| **PII Detection & Redaction** | Microsoft Presidio (OSS) as OTel Collector processor replacing PII patterns with typed redaction tokens before any storage backend. | ✅ Microsoft Presidio (OSS) as OTel Collector processor; on-prem deployment | ✅ Microsoft Presidio (OSS) in OTel Collector on AKS; runs before log storage | ✅ Presidio in each zone independently; no PII crosses zone boundaries in logs |
| **Apple Privacy Manifest** | PrivacyInfo.xcprivacy manifest auto-generated in EAS Build pipeline from CycloneDX SBOM, mapping each SDK to its declared API usages. | ✅ CycloneDX SBOM-driven auto-generation in EAS Build pipeline; backend-agnostic | ✅ Same pipeline; build runs in EAS cloud; manifest committed to repo in CI | ✅ Same pipeline; EAS Build is always cloud; no on-prem impact on Apple compliance |
| **Right to Erasure (GDPR Art 17)** | Erasure event published to Azure Service Bus. Azure Durable Function orchestrates confirmation from each microservice within 30 days. | ✅ Azure Durable Function or on-prem worker; Service Bus erasure message per tenant | ✅ Azure Durable Function; Service Bus erasure message consumed by each microservice | ✅ Erasure message via Service Bus; cloud microservices + on-prem services each confirm |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

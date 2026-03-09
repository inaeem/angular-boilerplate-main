# Compliance & Privacy

> Regulatory frameworks, governance tooling, privacy architecture, and audit controls required for enterprise mobile platforms operating across multiple jurisdictions.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Regulatory Compliance

### GDPR / CCPA

GDPR (EU) and CCPA (California) require lawful basis for personal data processing, transparent consent, data subject rights (access, rectification, erasure, portability), and breach notification. The OneTrust SDK gates all analytics and tracking events on mobile behind a consent prompt. Microsoft Purview auto-discovers and classifies PII across Azure storage. The Right to Erasure is implemented as an Azure Durable Function triggered by a Service Bus erasure message, confirmed by each microservice.

### HIPAA

HIPAA governs Protected Health Information (PHI) in US healthcare contexts. Microsoft's Business Associate Agreement (BAA) covers all Azure services used in the platform architecture. The Azure HIPAA Blueprint provides pre-built policy assignments, Key Vault HSM key management for PHI encryption, and Defender for Cloud scoring against HIPAA controls. On-premises deployments require a separate BAA with hardware vendors and manual HIPAA control implementation.

### SOC 2 Type II

SOC 2 Type II audits the design and operating effectiveness of security, availability, processing integrity, confidentiality, and privacy controls over a minimum 6-month observation period. Drata integrates natively with Azure to collect continuous automated evidence from Azure Policy, Entra ID, GitHub Actions, and Defender for Cloud. On-premises control evidence is collected manually, increasing audit preparation time and human error risk.

### PCI-DSS

Payment Card Industry Data Security Standard applies if the app processes, stores, or transmits cardholder data. The architecture minimises PCI scope by using Stripe or Adyen mobile SDKs: the SDK handles card tokenisation entirely within the payment provider's certified environment, meaning card numbers (PAN) never touch application servers. Azure's PCI DSS Blueprint covers the limited infrastructure that remains in scope.

### ISO 27001

ISO 27001 is an international information security management standard certifying that an organisation operates a documented and continuously improving ISMS (Information Security Management System). Azure provides an ISO 27001 workbook within Defender for Cloud with pre-mapped controls. Organisations can layer their ISMS documentation on top of Azure's certified infrastructure to scope and simplify their own certification audit.

### Data Residency / Sovereignty

The legal requirement that data be stored and processed within a specific geographic jurisdiction. Azure's 60+ global regions allow precise data placement. The architecture separates EU user data to EU regions (West Europe, North Europe) from US data via tenant-level routing. Highly regulated on-premises deployments can offer the strongest sovereignty guarantee — data physically cannot leave a specific building or jurisdiction without explicit operator action.

### WCAG 2.2 AA Accessibility

Web Content Accessibility Guidelines 2.2 Level AA is the accessibility compliance baseline for enterprise mobile apps targeting public sector and large enterprise customers. Automated axe-core and react-native-accessibility-engine checks in CI catch regressions in screen reader labels, colour contrast (≥4.5:1 for normal text), touch target sizing (≥44×44pt), and keyboard navigability for external keyboard users on iPad.

### EU AI Act (if AI ops used)

The EU AI Act classifies AI systems by risk tier. The architecture scopes AI exclusively to developer tooling (GitHub Copilot, code review suggestions) and operational aids (Copilot for Azure KQL generation, Grafana Sift RCA) — all categorised as low-risk or out-of-scope productivity tools with human review gates. No AI system makes autonomous decisions affecting end-users, avoiding high-risk classification and the associated conformity assessment requirements.

## Governance Tooling

### Policy as Code

Azure Policy enforces configuration compliance rules across the entire Azure subscription as code: all storage accounts must have HTTPS-only access, all AKS clusters must enable Azure Defender, all Key Vault keys must have expiry dates set. Policies are evaluated continuously in audit mode and can be set to deny non-compliant resource creation. On-premises uses OPA/Gatekeeper for equivalent Kubernetes admission control.

### Security Posture Scoring

Microsoft Defender for Cloud provides a continuous Secure Score — a percentage reflecting how many recommended security controls across the subscription are implemented. The score is tracked as a platform KPI alongside reliability SLOs. It is mapped to industry frameworks (CIS Benchmarks, NIST SP 800-53, ISO 27001) for compliance evidence. OpenSCAP is used for on-premises node hardening verification.

### Data Governance / Catalog

Microsoft Purview scans Azure PostgreSQL, Blob Storage, and Cosmos DB to discover, classify, and label sensitive data assets automatically. It builds a lineage graph showing how data flows from ingestion through transformation to mobile API. This catalog is the primary tool for responding to GDPR subject access requests — identifying all locations where a specific user's data is stored.

### Audit Log Immutability

Every privileged action — Key Vault secret access, Entra ID role assignment change, ArgoCD deployment event, database schema migration — is written as a structured audit event to Azure Blob immutable storage (WORM policy). The immutability policy prevents deletion, and the blob is geo-redundant for disaster recovery. These logs constitute legally admissible evidence for SOC 2 Type II and HIPAA audit trails.

### SBOM Management

A Software Bill of Materials enumerates all first- and third-party components in a release, including transitive npm dependencies and base container image packages. CycloneDX format SBOMs are generated automatically by the EAS Build pipeline and stored in Azure Blob immutable storage with the release version tag. SBOMs enable rapid CVE impact assessment when a new vulnerability is disclosed in a widely-used library.

## Privacy Architecture

### Consent Management (Mobile)

The OneTrust SDK presents the consent prompt on first launch and at each subsequent policy revision, recording the user's explicit consent or refusal for each data processing purpose (analytics, personalisation, marketing). No analytics SDK initialises until consent is granted. Consent records are written to a consent ledger in PostgreSQL and replicated to Microsoft Purview for GDPR accountability evidence.

### PII Detection & Redaction

Microsoft Presidio (OSS) is deployed as a processor within the OpenTelemetry Collector pipeline. It analyses structured log fields and trace attributes for PII patterns — email addresses, phone numbers, national ID formats, credit card patterns — and replaces matches with typed redaction tokens before forwarding to any storage backend. This ensures PII cannot accumulate in Log Analytics or Loki indexes regardless of developer logging hygiene.

### Apple Privacy Manifest

From iOS 17.4, Apple requires a PrivacyInfo.xcprivacy manifest in every app and SDK declaring all API usage reasons and data collection categories. The manifest is auto-generated in the EAS Build pipeline from the CycloneDX SBOM — each SDK dependency is mapped to its declared API usages, generating a merged manifest that satisfies App Store review. Without automation, this manifest must be manually maintained as dependencies change.

### Right to Erasure (GDPR Art 17)

When a user requests deletion of their account and personal data, an erasure event is published to Azure Service Bus. Each microservice subscribes to the erasure topic and is contractually obligated to confirm deletion of the user's records within 30 days. An Azure Durable Function orchestrates the process, tracking acknowledgement from each service and escalating to the data protection officer if any service fails to confirm within the deadline.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

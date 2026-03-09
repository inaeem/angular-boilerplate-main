# Enterprise Mobile Architecture
## On-Premises vs Cloud (Azure + OSS) vs Hybrid — Criteria Reference

> Comprehensive criterion-by-criterion descriptions for the 153-point comparison covering
> the full enterprise mobile platform lifecycle across all three deployment models.

---

## Scope & Context

This reference accompanies the side-by-side comparison spreadsheet.
Each README below describes **what each criterion means**, **why it matters for enterprise mobile**,
and **how the on-premises, cloud, and hybrid models approach it differently**.

Architecture assumptions:
- **Framework**: React Native (Expo SDK 51+), TypeScript strict, Nx monorepo
- **Cloud**: Azure-native managed services + OSS for portability
- **Auth**: OAuth 2.0 + OIDC + PKCE + PAR, Entra ID, react-native-msal
- **AI boundary**: Scoped strictly to developer tooling and ops — no AI in end-user product
- **Horizon**: 3–5 year sustainability with portability as a first-class concern

---

## Sheet Index

| # | README | Description | Criteria |
|---|---|---|---|
| 1 | [Infrastructure & Compute](./01_infrastructure_compute.md) | Server infrastructure, container orchestration, networking topology, a… | 19 |
| 2 | [Identity & Security](./02_identity_security.md) | Identity providers, authentication protocols, secrets management, zero… | 17 |
| 3 | [Data Storage](./03_data_storage.md) | Relational databases, distributed caching, object storage, mobile offl… | 15 |
| 4 | [Mobile Development Stack](./04_mobile_dev_stack.md) | Application framework, architecture patterns, state management, and de… | 15 |
| 5 | [CI/CD & Release Management](./05_cicd_release.md) | Continuous integration, build pipelines, GitOps deployment, progressiv… | 17 |
| 6 | [Observability](./06_observability.md) | Metrics collection, log aggregation, distributed tracing, crash report… | 14 |
| 7 | [Compliance & Privacy](./07_compliance_privacy.md) | Regulatory frameworks, governance tooling, privacy architecture, and a… | 17 |
| 8 | [Cost Model](./08_cost_model.md) | Capital vs operating expenditure trade-offs, operational headcount cos… | 13 |
| 9 | [Scalability & Performance](./09_scalability_performance.md) | Horizontal scale-out speed, burst capacity ceilings, global distributi… | 10 |
| 10 | [Decision Guide](./10_decision_guide.md) | Strategic advantages, risk assessment, and a structured framework for … | 16 |
| — | **Total** | | **153** |

---

## Signal Conventions

Each criterion in the spreadsheet carries a signal indicator:

| Signal | Meaning |
|---|---|
| ✔ | Advantage or recommended approach for this dimension |
| ⚠ | Neutral, trade-off, or requires additional context |
| ✖ | Disadvantage, risk, or significant operational burden |

---

*Architecture designed for a 3–5 year horizon. All criteria evaluated against enterprise mobile at scale (50K–500K MAU).*
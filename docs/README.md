# Enterprise Mobile Architecture
## On-Premises vs Cloud (Azure + OSS) vs Hybrid — Side-by-Side Comparison

> Full criterion-by-criterion comparison across all 10 domains.
> Each table lists the criterion, a plain-language description, and the on-premises,
> cloud, and hybrid implementation side-by-side with a signal indicator.

---

## Architecture Assumptions

| Dimension | Choice |
|---|---|
| Framework | React Native (Expo SDK 51+), TypeScript strict |
| Monorepo | Nx |
| Cloud Target | Azure-native managed services + OSS application layer |
| Auth | OAuth 2.0 + OIDC + PKCE + PAR, Entra ID, react-native-msal |
| AI Boundary | Scoped strictly to developer tooling and ops — **no AI in end-user product** |
| Horizon | 3–5 year sustainability with portability as a first-class concern |

---

## Sheet Index

| # | Domain | Sections | Criteria |
|---|---|---|---|
| [Infrastructure & Compute](./01_infrastructure_compute.md) | Server infrastructure, container orchestration, networking topolo… | 3 | 19 |
| [Identity & Security](./02_identity_security.md) | Identity providers, authentication protocols, secrets management,… | 3 | 17 |
| [Data Storage](./03_data_storage.md) | Relational databases, distributed caching, object storage, docume… | 4 | 15 |
| [Mobile Development Stack](./04_mobile_dev_stack.md) | Application framework, architecture patterns, state management, f… | 4 | 15 |
| [CI/CD & Release Management](./05_cicd_release.md) | Continuous integration, build pipelines, GitOps deployment, progr… | 4 | 17 |
| [Observability](./06_observability.md) | Metrics, logging, distributed tracing, crash reporting, real-user… | 4 | 14 |
| [Compliance & Privacy](./07_compliance_privacy.md) | Regulatory frameworks, governance tooling, privacy architecture, … | 3 | 17 |
| [Cost Model](./08_cost_model.md) | Capital vs operating expenditure trade-offs, headcount costs, cos… | 3 | 13 |
| [Scalability & Performance](./09_scalability_performance.md) | Horizontal scale-out speed, burst capacity ceilings, global distr… | 2 | 10 |
| [Decision Guide](./10_decision_guide.md) | Strategic advantages, risk assessment, and a structured framework… | 3 | 16 |
| **Total** | | | **153** |

---

## Signal Key

| Signal | Meaning |
|:---:|---|
| ✅ | Advantage or recommended approach for this dimension |
| ⚠️ | Neutral, trade-off, or requires additional context |
| ❌ | Disadvantage, risk, or significant operational burden |

---

*Architecture designed for a 3–5 year horizon. All criteria evaluated against enterprise mobile at scale (50K–500K MAU).*
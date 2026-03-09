# Mobile Development Stack

> Application framework, architecture patterns, state management, forms, and design system tooling — all client-side and largely backend-agnostic.

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

## Application Framework

_The cross-platform runtime, build tooling, language baseline, and monorepo orchestration that every engineer touches daily._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Mobile Framework** | React Native (Expo SDK 51+) providing a shared TypeScript codebase for iOS and Android. Backend deployment is transparent to the framework. | ✅ React Native (Expo SDK 51+) — OSS; backend-agnostic; same regardless | ✅ React Native (Expo SDK 51+) — same; cloud deployment has no impact on framework | ✅ React Native (Expo SDK 51+) — same; hybrid backend is transparent to mobile client |
| **New Architecture (JSI/Fabric)** | JSI (synchronous bridge), Fabric (concurrent renderer), TurboModules (lazy native loading). Enabled by default in Expo SDK 51+. Client-side concern. | ✅ Enabled by default in Expo SDK 51+; no dependency on backend infrastructure | ✅ Enabled by default in Expo SDK 51+; backend deployment is irrelevant | ✅ Same — New Architecture is a client-side concern |
| **Language / Type Safety** | TypeScript strict mode enforced across the monorepo — mobile app, BFF, shared domain libraries, and IaC type bindings. | ✅ TypeScript strict — fully backend-agnostic; same regardless of deployment | ✅ TypeScript strict — same regardless of Azure or self-hosted backend | ✅ TypeScript strict — backend model has no impact on client type system |
| **Monorepo Tooling** | Nx manages the monorepo with affected-only CI execution, code generators, and enforced module boundary rules. | ✅ Nx (OSS) — runs on any CI (Jenkins, GitLab, GitHub Actions on self-hosted) | ✅ Nx (OSS) — natively integrated with GitHub Actions + Azure DevOps Pipelines | ✅ Nx (OSS) — same; CI agents may be split: cloud runners + on-prem self-hosted runners |

## Architecture Patterns

_Layered architecture, repository pattern, BFF aggregation, and offline-first design principles governing how the application is structured independently of backend topology._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Layered Architecture** | Five-layer model: Presentation / ViewModel / Domain / Data / Infrastructure. Dependencies flow inward only — Domain has no knowledge of React Native or any specific API backend. | ✅ Presentation / ViewModel / Domain / Data / Infra — framework-agnostic pattern | ✅ Same layered architecture; cloud services appear only in Infrastructure Layer | ✅ Same layered architecture; on-prem and cloud services both in Infrastructure Layer |
| **Repository Pattern** | Typed Repository interfaces in the Domain layer hiding whether data comes from local cache, on-prem API, or Azure API. Only the Infrastructure implementation changes. | ✅ Repository interfaces hide whether data comes from on-prem API or local cache | ✅ Repository interfaces hide whether data comes from Azure API or local cache | ✅ Repositories may resolve to cloud API or on-prem API based on tenant routing config |
| **BFF (Backend for Frontend)** | Apollo Server GraphQL aggregating calls to multiple downstream microservices, allowing backend breaking changes to be absorbed without app releases. | ⚠️ Apollo Server on self-managed K8s; shapes API for mobile; full ops overhead | ✅ Apollo Server on AKS or Container Apps; APIM shapes external contract | ✅ BFF on AKS cloud; may proxy calls to on-prem microservices via ExpressRoute tunnel |
| **Offline-First Pattern** | Default operating assumption that the network may not be available. Reads first consult WatermelonDB; network fetches applied in background via sync engine. | ✅ WatermelonDB + custom sync service; conflict resolution via CRDTs or LWW | ✅ WatermelonDB + sync on AKS; Service Bus for reliable event delivery | ✅ WatermelonDB; sync service on AKS routes to cloud DB or on-prem DB per data class |

## State & Forms

_Server state lifecycle management, global client state, and type-safe form validation — all client-side libraries with no backend dependency._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Server State** | TanStack Query v5 managing fetching, caching, background revalidation, pagination, optimistic updates, and error retry. Backend-agnostic. | ✅ TanStack Query v5 — OSS; points to self-hosted API; fully backend-agnostic | ✅ TanStack Query v5 — same; points to APIM or BFF endpoint | ✅ TanStack Query v5 — same; endpoint routing differs per feature, transparent to library |
| **Global Client State** | Zustand managing lightweight global UI state: auth session metadata, modal state, theme preference. Minimal API, no backend dependency. | ✅ Zustand — OSS; fully client-side; no backend dependency | ✅ Zustand — same; no backend dependency | ✅ Zustand — same; no backend dependency |
| **Form Validation** | React Hook Form + Zod providing end-to-end type-safe schema validation usable on both client form validation and server API response parsing. | ✅ React Hook Form + Zod — OSS; fully client-side; no backend dependency | ✅ React Hook Form + Zod — same | ✅ React Hook Form + Zod — same |

## Design System

_Token pipeline from Figma to code, component library, automated accessibility enforcement, and visual regression testing._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Design Tokens Pipeline** | Figma Variables → Style Dictionary generating TypeScript, Xcode xcassets, and Android XML from a single designer source of truth. | ✅ Figma Variables → Style Dictionary (OSS) → TS + iOS + Android; backend-agnostic | ✅ Same pipeline; Storybook hosted on Azure Static Web Apps (free tier, zero-infra) | ✅ Same pipeline; Storybook hosted on Azure Static Web Apps |
| **Component Library** | Tamagui providing a high-performance universal component library with compile-time style optimisation for both React Native and React Native Web. | ✅ Tamagui (OSS) — fully client-side; no backend dependency | ✅ Tamagui (OSS) — same | ✅ Tamagui (OSS) — same |
| **Accessibility** | axe-core + react-native-accessibility-engine auditing WCAG 2.2 AA criteria on every pull request as a blocking gate. | ✅ axe-core + react-native-accessibility-engine in CI (GitHub Actions self-hosted) | ✅ axe-core + react-native-accessibility-engine in GitHub Actions (cloud runners) | ✅ Same accessibility CI gates; runner location (cloud vs on-prem) is irrelevant |
| **Visual Regression** | Chromatic capturing pixel-level screenshots of all Storybook stories on every PR and comparing against approved baseline. | ⚠️ Chromatic self-hosted or Loki (OSS); requires self-hosted infra for Storybook | ✅ Chromatic SaaS (preferred) or self-hosted on AKS; Azure Static Web Apps for Storybook | ✅ Chromatic SaaS; Storybook on Azure Static Web Apps — not affected by hybrid backend |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

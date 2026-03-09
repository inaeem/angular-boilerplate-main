# Mobile Development Stack

> Application framework, architecture patterns, state management, and design system tooling that form the client-side engineering foundation of the mobile platform.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Application Framework

### Mobile Framework

React Native with the Expo SDK is the chosen cross-platform mobile framework, providing a shared TypeScript codebase for iOS and Android with access to native modules via the JSI (JavaScript Interface). Expo SDK 51+ ships the New Architecture enabled by default. The framework is entirely client-side and architecturally decoupled from backend deployment model — whether services run on-premises, in Azure, or split between both is transparent to React Native.

### New Architecture (JSI/Fabric)

React Native's modernised runtime comprising JSI (synchronous JS-to-native bridge replacing the asynchronous JSON message bus), Fabric (the concurrent renderer integrated with React 18's scheduler), and TurboModules (lazy-loaded native modules). Together these deliver synchronous access to native APIs, reduced startup overhead, and deterministic layout timing. This is a client-side architectural feature independent of backend topology.

### Language / Type Safety

TypeScript in strict mode (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) is enforced across the entire monorepo — mobile app, BFF, shared domain libraries, and IaC type bindings. TypeScript strict mode eliminates entire classes of null-reference and type coercion bugs at compile time. This is a codebase-level concern independent of where services are deployed.

### Monorepo Tooling

Nx manages the monorepo, providing a dependency graph, affected-only CI execution (rebuilding only packages changed since the last successful run), code generators, and enforced module boundary rules. The affected graph is critical for CI performance: a change to the BFF package does not trigger a mobile E2E test run. Nx runs on any CI provider — GitHub Actions cloud runners, GitHub Actions self-hosted runners, or Azure DevOps agents.

## Architecture Patterns

### Layered Architecture

The mobile application is structured into five concentric layers: Presentation (React Native screens and components), ViewModel (business presentation logic, useX hooks), Domain (pure business rules, entities, use-case interactors), Data (repository implementations, local DB models), and Infrastructure (network clients, device APIs). Dependencies flow inward only — the Domain layer has no knowledge of React Native, TanStack Query, or any specific API backend.

### Repository Pattern

Each data entity is accessed exclusively through a typed Repository interface defined in the Domain layer. Concrete implementations in the Infrastructure layer resolve whether data comes from WatermelonDB (offline), a cached TanStack Query result, or an API call. Swapping an on-premises API for an Azure-hosted one requires changing only the Infrastructure implementation; no Domain or Presentation code is touched.

### BFF (Backend for Frontend)

An Apollo Server GraphQL service that acts as the sole API surface for the mobile client. It aggregates calls to multiple downstream microservices, applies mobile-specific field selection and pagination defaults, and translates REST/gRPC responses into the GraphQL schema the app expects. This eliminates over-fetching, reduces client-side aggregation logic, and allows backend breaking changes to be absorbed at the BFF layer rather than requiring app releases.

### Offline-First Pattern

The architecture principle that the mobile app's default operating assumption is that the network may not be available. All reads first consult the local WatermelonDB database; network fetches are triggered in the background and applied to the local store via the sync engine. This pattern is mandatory for enterprise apps deployed to mobile workers in areas with unreliable connectivity — warehouses, field service, clinical environments.

## State & Forms

### Server State

TanStack Query v5 manages the lifecycle of all server-derived data: fetching, caching, background revalidation, pagination, optimistic updates, and error retry. Its cache serves as the source of truth for all data that originates from the API. TanStack Query operates entirely in the React layer and is agnostic to whether the API is hosted on-premises or in Azure — only the base URL configuration differs.

### Global Client State

Zustand manages lightweight global UI state that does not originate from the server: authentication session metadata, modal open/close state, theme preference, and navigation history. Zustand's minimal API surface and React hooks integration make it significantly simpler to operate than Redux for mobile use cases. It is a client-side library with no backend dependency.

### Form Validation

React Hook Form handles form registration, dirty-state tracking, and submission lifecycle with zero controlled-component re-renders. Zod provides end-to-end type-safe schema validation: the same Zod schema can validate a form on the client and parse an API response on the server, ensuring the type contract is enforced at both boundaries without duplication.

## Design System

### Design Tokens Pipeline

Figma Variables (the designer's source of truth for colour, spacing, typography, and motion) are exported via a CI step into Style Dictionary, which transpiles them into platform-specific token formats: TypeScript constants for React Native, Xcode xcassets for native iOS, and Android XML resources. This single-source pipeline prevents design drift between platforms and eliminates manual token synchronisation.

### Component Library

Tamagui provides a high-performance universal component library supporting both React Native and React Native Web targets from a single codebase. Its compiler-time style optimisation generates platform-native StyleSheet objects rather than runtime-interpreted style objects, yielding faster first render times on mobile. Components consume design tokens from Style Dictionary ensuring automatic theme compliance.

### Accessibility

Automated accessibility auditing is embedded in the CI pipeline using axe-core (for Storybook web rendering) and react-native-accessibility-engine (for native mobile rendering). These tools audit against WCAG 2.2 AA criteria on every pull request. Failures are blocking: no PR merges with a regression to keyboard navigation, screen reader labels, contrast ratios, or touch target sizes.

### Visual Regression

Chromatic captures pixel-level screenshots of all Storybook component stories on every PR and compares them against the approved baseline. Any unintended visual change — even a 1px layout shift — surfaces as a blocking review item. Storybook is hosted on Azure Static Web Apps, providing branch-level deployment previews for designer review without requiring local environment setup.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

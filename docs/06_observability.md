# Observability

> Metrics, logging, distributed tracing, crash reporting, real-user monitoring, and AI-assisted operational tooling across cloud and on-premises zones.

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

## Metrics

_Prometheus-format metric collection, Grafana visualisation, SLO dashboarding, and alert routing for both backend services and mobile client health indicators._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Metrics Collection** | All services expose Prometheus metrics. Azure Managed Prometheus scrapes and stores time-series without operating Prometheus server, Thanos, or Alertmanager. | ⚠️ Prometheus (OSS) self-managed; Thanos for long-term storage; alertmanager | ✅ Azure Managed Prometheus — fully managed; PromQL compatible; no Prometheus server | ✅ Azure Managed Prometheus for cloud zone; self-managed Prometheus for on-prem zone |
| **Metrics Visualization** | Azure Managed Grafana pre-wired to Azure Monitor, Entra ID SSO, and all Azure datasources. OSS Grafana API ensures portability. | ⚠️ Grafana (OSS) self-managed on on-prem K8s; full plugin control | ✅ Azure Managed Grafana — pre-wired to Azure Monitor; Entra ID SSO; no infra | ✅ Azure Managed Grafana; single pane of glass for cloud + on-prem Prometheus |
| **Mobile SLO Dashboards** | Mobile SLOs — crash-free sessions ≥99.5%, cold start p95 ≤2.5s, OTA adoption ≥85%, push delivery ≥97% — tracked alongside backend SLOs on a single dashboard. | ⚠️ Grafana dashboards querying self-managed Prometheus + Sentry datasource | ✅ Azure Managed Grafana with Prometheus + Sentry + Azure Monitor datasources | ✅ Single Grafana instance aggregates cloud Prometheus, on-prem Prometheus, and Sentry |
| **Alerting** | Grafana OnCall (OSS) handling alert routing, escalation policies, and on-call schedule management with PagerDuty integration. | ⚠️ Grafana OnCall (OSS) self-managed; PagerDuty integration; on-prem runbooks | ✅ Grafana OnCall (OSS) on AKS or Grafana Cloud; PagerDuty escalation policies | ✅ Grafana OnCall on AKS cloud; alerts fire regardless of which zone is impacted |

## Logging

_Structured log aggregation, compliance-grade retention with WORM enforcement, and automated PII redaction before log storage._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Log Aggregation** | OTel Collector DaemonSet on AKS collects, enriches, and forwards structured JSON logs to Azure Log Analytics or Grafana Loki. | ⚠️ Grafana Loki (OSS) self-managed; Azure Blob / MinIO as object store backend | ✅ Azure Log Analytics Workspace — managed; KQL queries; 90-day hot retention | ✅ Azure Log Analytics (cloud) + Loki (on-prem); Grafana unifies both datasources |
| **Log Retention (Compliance)** | Tiered retention: 90-day hot application logs, 7-year HIPAA audit logs, 1-year SOC 2 security events. Azure Blob lifecycle policies automate tiering. | ⚠️ MinIO WORM-tier + Loki ruler; manual retention job scheduling | ✅ Azure Blob archive tier (immutable) — automated lifecycle; 7-year HIPAA retention | ✅ Azure Blob immutable for cloud logs; on-prem WORM storage for on-prem log compliance |
| **Sensitive Data Redaction** | Microsoft Presidio (OSS) as OTel Collector processor replacing PII patterns with typed redaction tokens before forwarding to any storage backend. | ✅ OTel Collector processor (on-prem) redacts PII before log storage — same tooling | ✅ OTel Collector processor (AKS) redacts PII before Azure Log Analytics ingestion | ✅ OTel Collector in each zone independently redacts before forwarding to storage |

## Tracing & Errors

_Distributed trace correlation across the full mobile request chain, vendor-neutral OTel instrumentation, self-hosted crash reporting, and real-user performance monitoring._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Distributed Tracing** | Every API request spanning mobile client → Front Door → APIM → BFF → microservice tracked as a single trace with spans at each boundary. | ⚠️ Jaeger (OSS) self-managed; OTel SDK in all services; on-prem storage | ✅ OpenTelemetry → Azure Application Insights (OTLP ingest); managed storage | ✅ OTel Collector in each zone; cloud traces → App Insights; on-prem traces → Jaeger |
| **Instrumentation Standard** | OpenTelemetry SDK — vendor-neutral CNCF standard for traces, metrics, and logs. Destination changes without modifying application code. | ✅ OpenTelemetry SDK — OSS; vendor-neutral; same regardless of backend | ✅ OpenTelemetry SDK — same; zero vendor lock-in at application code layer | ✅ OpenTelemetry SDK — same; backend destination differs per zone, not per app |
| **Crash Reporting (Mobile)** | Sentry (OSS, self-hosted on AKS) capturing unhandled exceptions with symbolicated stack traces. Crash data stays within Azure tenant boundary. | ✅ Sentry (OSS, self-hosted) on on-prem K8s; crash data never leaves premises | ✅ Sentry (OSS, self-hosted) on AKS — crash data stays within Azure subscription | ✅ Sentry on AKS cloud zone; crash data stays within Azure tenant regardless |
| **Real User Monitoring (RUM)** | Sentry Performance tracking real-device transaction timings: cold start, screen-to-interactive, API latency distribution from actual user devices. | ✅ Sentry Performance on self-hosted Sentry — app startup, API latency | ✅ Sentry Performance (self-hosted AKS) — same quality RUM data | ✅ Sentry Performance on AKS; covers mobile client interactions with both backend zones |

## Operational Tooling

_AI-assisted incident diagnosis, automated capacity planning recommendations, and cost anomaly detection. AI scoped strictly to operational tooling — never to end-user product features._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Incident Management (AI Ops)** | Copilot for Azure generates KQL queries from natural language during incidents. Grafana Sift performs automated RCA on alert fire. AI advisory only — human retains authority. | ⚠️ Manual KQL / PromQL authoring; GitHub Copilot assists query writing in IDE | ✅ Microsoft Copilot for Azure (natural language Log Analytics) + Grafana Sift (OSS) | ⚠️ Copilot for Azure covers cloud logs; on-prem requires manual or Grafana Sift only |
| **Capacity Planning** | Azure Advisor analyses 30-day utilisation trends and recommends right-sizing and reserved instance purchases. | ⚠️ Manual utilisation reviews; k6 load tests to model capacity needs | ✅ Azure Advisor automated right-sizing + reserved instance recommendations | ⚠️ Azure Advisor for cloud; manual capacity reviews for on-prem segment |
| **Cost Anomaly Detection** | Azure Cost Management sends automated alerts when daily spend deviates from rolling average baseline, catching runaway scaling events early. | ❌ No native tooling; manual billing reviews; FinOps tooling required | ✅ Azure Cost Management anomaly alerts — automated spend spike detection | ⚠️ Azure Cost Management for cloud spend; on-prem costs managed via CapEx budget |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

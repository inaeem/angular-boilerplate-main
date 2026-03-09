# Observability

> Metrics collection, log aggregation, distributed tracing, crash reporting, real-user monitoring, and AI-assisted operational tooling for the mobile platform.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Metrics

### Metrics Collection

All services expose Prometheus-format metrics at `/metrics`. Azure Managed Prometheus scrapes these endpoints and stores the time-series data with a fully managed retention backend, eliminating the operational overhead of running Prometheus server, Thanos, and Alertmanager in-house. On-premises uses self-managed Prometheus with Thanos for long-term object storage. Both expose the same PromQL query surface for Grafana dashboards.

### Metrics Visualization

Azure Managed Grafana provides pre-configured datasource integrations for Azure Managed Prometheus, Azure Monitor, and Azure Log Analytics, backed by Entra ID SSO for access control. It is the single pane of glass for all platform health visibility. Teams create squad-specific dashboards in their own Grafana folders without requiring shared dashboard credentials. The OSS Grafana API is fully compatible, protecting the investment if the platform later migrates from Azure.

### Mobile SLO Dashboards

Mobile-specific SLOs — crash-free sessions (≥99.5%), cold start p95 (≤2.5s), OTA adoption 48h (≥85%), push delivery rate (≥97%) — are tracked on dedicated Grafana dashboards alongside backend SLOs (API p95 latency, error rate). This collocated view is critical for correlating a mobile regression with an upstream backend degradation during incident response.

### Alerting

Grafana OnCall (OSS) handles alert routing, escalation policies, and on-call schedule management. Alerts from Prometheus alerting rules fire into Grafana OnCall, which pages the on-call engineer via PagerDuty, with escalation to the squad lead if not acknowledged within 15 minutes. Azure Monitor dynamic threshold alerts use ML-based baselines to detect anomalies without requiring manual threshold calibration.

## Logging

### Log Aggregation

All microservices emit structured JSON logs to stdout. The OpenTelemetry Collector deployed as a DaemonSet on AKS collects, enriches with resource attributes, and forwards to Azure Log Analytics Workspace. On-premises uses Grafana Loki with Azure Blob or MinIO as the object store backend. Grafana's unified datasource model allows both Azure Log Analytics and Loki to be queried from the same dashboard.

### Log Retention (Compliance)

Different log categories have different regulatory retention requirements: application logs (90 days hot), audit logs (7 years HIPAA minimum), security events (1 year SOC 2 minimum). Azure Blob lifecycle management policies automate the tiering from hot to cool to archive. Immutable storage policy prevents deletion within the retention window. On-premises replicates this through MinIO WORM bucket configuration and custom retention job scheduling.

### Sensitive Data Redaction

An OpenTelemetry Collector processor pipeline applies Microsoft Presidio PII detection to all log records before they are forwarded to any storage backend. Phone numbers, email addresses, names, and national ID numbers matching configurable patterns are replaced with [REDACTED] tokens. This processor runs in both the cloud and on-premises OTel Collector deployments, ensuring PII never reaches Log Analytics or Loki.

## Tracing & Errors

### Distributed Tracing

Every API request spanning the mobile client → Front Door → APIM → BFF → microservice chain is tracked as a single trace with spans at each service boundary. OpenTelemetry SDKs instrument all services automatically. Traces are exported via OTLP to Azure Application Insights, which provides trace search, dependency maps, and failure analytics. On-premises exports to Jaeger.

### Instrumentation Standard

OpenTelemetry is the vendor-neutral CNCF standard for trace, metric, and log instrumentation. All services — Node.js BFF, Go microservices, React Native mobile app — use the official OTel SDK for their respective language. The OTel Collector acts as the routing layer, allowing the export destination (Application Insights, Jaeger, Datadog) to change without modifying application code.

### Crash Reporting (Mobile)

Sentry (OSS) self-hosted on AKS captures unhandled exceptions, React Native crash reports, and JavaScript error boundaries from mobile clients. Crash reports include device metadata, breadcrumb event sequence, and symbolicated stack traces. Self-hosting Sentry ensures that crash data — which may contain user context from the breadcrumb trail — never leaves the Azure tenant boundary, supporting GDPR data residency requirements.

### Real User Monitoring (RUM)

Sentry Performance tracks real-device transaction timings from the mobile app: cold start duration, screen-to-interactive time, API call latency distribution, and time-to-first-contentful-paint for WebView screens. These measurements feed the mobile SLO dashboard and provide the ground truth for performance regression detection between releases, complementing synthetic Detox test timings with actual user experience data.

## Operational Tooling

### Incident Management (AI Ops)

AI is scoped strictly to operational tooling — never to end-user product features. During an incident, Microsoft Copilot for Azure accepts natural language questions ('Show me all 5xx errors from the BFF in the last 30 minutes broken down by endpoint') and generates KQL queries against Log Analytics, accelerating time-to-diagnosis. Grafana Sift automatically analyses metric and log data on alert fire to identify probable root cause before the on-call engineer has finished acknowledging the page.

### Capacity Planning

Azure Advisor analyses 30-day utilisation trends and recommends right-sizing for AKS node pools, PostgreSQL compute SKUs, and Redis cache tiers. Reserved Instance purchase recommendations include projected 3-year NPV. On-premises capacity planning relies on Prometheus utilisation dashboards and manual quarterly review, with hardware procurement lead time creating a significant lag between identified need and available capacity.

### Cost Anomaly Detection

Azure Cost Management sends automated alerts when daily or weekly spend deviates more than a configurable threshold from the rolling average baseline. This catches runaway scaling events, accidentally left-running load tests, or unexpectedly high data transfer charges before they compound. On-premises infrastructure costs are primarily fixed CapEx amortisation, making anomaly detection less applicable — but under-utilisation waste is correspondingly harder to act on.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

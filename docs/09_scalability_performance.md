# Scalability & Performance

> Horizontal scale-out speed, burst capacity ceilings, global distribution, database scaling, mobile client performance targets, and CDN delivery characteristics.

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

## Scalability

_The platform's ability to handle traffic growth from baseline to burst without degradation or manual intervention._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Horizontal Scale-Out Speed** | Elapsed time between a load spike being detected and new compute capacity actively serving requests. | ❌ Minutes to hours: provisioning VMs + configuring K8s nodes; hardware bounded | ✅ Seconds: AKS Cluster Autoscaler + KEDA trigger new pods and nodes automatically | ⚠️ Seconds (cloud zone); bounded (on-prem zone) — elastic only where cloud is deployed |
| **Maximum Burst Capacity** | The theoretical ceiling on peak traffic. On-prem is hard-bounded by rack space. Cloud is bounded only by Azure regional quotas — effectively unlimited. | ❌ Hard ceiling: physical rack space and hardware; cannot exceed provisioned capacity | ✅ Effectively unlimited within Azure region; multi-region if one region is exhausted | ✅ Cloud zone can burst without limit; on-prem is hard-capped — hybrid enables overflow routing |
| **Global Distribution** | Serving mobile users with low API latency from geographically distributed regions. Azure Front Door routes to nearest healthy backend. | ❌ Requires multiple physical DCs; high CapEx; complex GSLB configuration | ✅ Azure Front Door + multi-region AKS; active-active global routing in hours | ⚠️ Front Door routes globally for cloud zone; on-prem accessible only from fixed locations |
| **Database Scaling** | Scaling PostgreSQL beyond a single server's capacity via read replicas and connection pooling. | ⚠️ Patroni + manual read replica addition; scale events require DBA + ops coordination | ✅ Azure PostgreSQL read replicas + connection pooling; elastic storage; auto-scaling | ⚠️ Azure PostgreSQL scales in cloud; on-prem PostgreSQL manual scale; separate ops paths |
| **Mobile Client Scale (Push)** | Push notification fan-out to millions of devices. Azure Notification Hubs built for this scale; custom relays require careful connection pool management to APNs. | ⚠️ Custom FCM/APNs relay; fan-out throughput limited by relay server capacity | ✅ Azure Notification Hubs: millions of devices; managed fan-out; no throughput ceiling | ✅ Notification Hubs (cloud) handles all mobile push regardless of where data lives |

## Performance

_API latency characteristics, mobile app cold start time, offline performance, response caching layers, and CDN asset delivery performance._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **API Latency (Mobile Client)** | Round-trip time experienced by the mobile app. Azure Front Door anycast reduces connection setup latency for global mobile clients significantly. | ⚠️ Low latency on corporate LAN; high latency for remote/mobile users outside office | ✅ Azure Front Door anycast: 150+ PoPs; consistent low latency globally | ✅ Front Door for internet users (low latency); on-prem for office intranet (ultra-low latency) |
| **Cold Start Time (App)** | Elapsed time from process launch to first interactive screen. Hermes AOT + TurboModules lazy loading are client-side optimisations independent of backend. | ✅ Hermes bytecode + New Architecture — client-side; backend deployment irrelevant | ✅ Hermes + New Architecture + Metro bundle splitting — same client-side optimization | ✅ Same client-side optimizations — backend model has zero impact on app cold start |
| **Offline Performance** | App responsiveness with no network connectivity. WatermelonDB sub-10ms queries, MMKV sub-millisecond KV reads — entirely device-local. | ✅ WatermelonDB + MMKV on device; full offline performance — backend irrelevant | ✅ WatermelonDB + MMKV; same offline performance — backend deployment irrelevant | ✅ Same device-local data stores; offline performance identical regardless of backend |
| **Response Caching** | TanStack Query (client) + Azure APIM response cache (edge) + Azure Cache for Redis (BFF) layers compound to dramatically reduce perceived API latency. | ✅ Redis OSS on-prem; NGINX proxy cache; TanStack Query client-side cache | ✅ Azure Cache for Redis + APIM response caching + TanStack Query client cache | ✅ Azure Cache for Redis (cloud); Redis OSS (on-prem); TanStack Query always on client |
| **CDN / Asset Performance** | Azure Front Door CDN at 150+ PoPs delivers JS bundles and OTA update packages with cache hit ratio exceeding 95% in production. | ❌ Limited PoPs with on-prem CDN (Varnish); poor performance for global users | ✅ Azure Front Door CDN: 150+ PoPs; 30–50ms edge for most global locations | ✅ Azure Front Door CDN for all public assets — hybrid backend does not affect CDN |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

# Scalability & Performance

> Horizontal scale-out speed, burst capacity ceilings, global distribution, database scaling patterns, mobile client performance targets, and CDN delivery characteristics.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Scalability

### Horizontal Scale-Out Speed

The elapsed time between a load spike being detected and new compute capacity being actively serving requests. On-premises requires manual VM provisioning or pre-warmed spare capacity, with new K8s nodes taking 5–30 minutes to be schedulable. AKS Cluster Autoscaler provisions new nodes in 2–5 minutes; KEDA can scale pods from zero to handling traffic in under 30 seconds for pre-warmed node pool configurations.

### Maximum Burst Capacity

The theoretical ceiling on peak traffic the architecture can serve. On-premises is hard-bounded by physical rack space and procured hardware. Cloud is bounded only by Azure regional quotas, which can be raised on request and are effectively unlimited for enterprise workloads. This distinction is critical for mobile platforms with unpredictable usage spikes from marketing campaigns, feature launches, or viral sharing.

### Global Distribution

Serving mobile users with low API latency from geographically distributed regions. Azure Front Door routes requests to the nearest healthy backend region with sub-100ms switchover on regional failure. Active-active multi-region AKS deployment can be configured using Azure Traffic Manager or Front Door origin groups. On-premises global distribution requires purchasing or leasing physical datacenter presence in each target region — a multi-million dollar investment.

### Database Scaling

Scaling PostgreSQL beyond a single server's capacity requires read replicas for read distribution and connection pooling (PgBouncer) for connection multiplexing. Azure PostgreSQL Flexible Server adds read replicas with a single API call and provides elastic storage auto-scaling to prevent disk-full events. On-premises replica addition requires DBA coordination, configuration file changes, and manual HAProxy weight adjustment.

### Mobile Client Scale (Push)

Push notification fan-out to millions of devices is a distinct scalability challenge separate from API scale. Azure Notification Hubs is purpose-built for this: it maintains persistent connections to both APNs and FCM, batches device registration lookups, and fans out to millions of devices in parallel. A custom push relay on self-managed infrastructure must be horizontally scaled and operated, with connection pool management to APNs being particularly operationally sensitive.

## Performance

### API Latency (Mobile Client)

The round-trip time experienced by the mobile app for API calls. Azure Front Door's anycast routing ensures mobile clients worldwide connect to the nearest Front Door PoP (150+), with the PoP maintaining persistent TCP connections to origin servers. This significantly reduces connection setup latency for mobile clients with high-latency or lossy connections. On-premises achieves low latency only for clients on the corporate LAN or a well-peered connection.

### Cold Start Time (App)

The elapsed time from process launch to the first interactive screen. React Native's Hermes engine compiles JavaScript to bytecode at build time (AOT compilation), eliminating the JIT warmup delay present in earlier React Native versions. The New Architecture's TurboModules load native modules lazily on first use rather than eagerly at startup. These are client-side optimisations that are independent of backend deployment model.

### Offline Performance

The responsiveness of the app when the device has no network connectivity. WatermelonDB provides indexed SQLite queries with Lazy-loading, returning results in sub-10ms for typical mobile query patterns. MMKV delivers sub-millisecond key-value reads from a memory-mapped file. These are device-local data stores — their performance is entirely determined by device hardware and is independent of backend topology.

### Response Caching

Multiple caching layers stack to reduce perceived API latency for the mobile user. TanStack Query provides in-process client-side caching with configurable stale-while-revalidate semantics. Azure APIM response caching stores GET responses at the gateway edge. Azure Cache for Redis stores BFF-level aggregated query results. These layers compound: a stale TanStack Query hit never reaches the network; a fresh-but-cached APIM response never reaches the BFF.

### CDN / Asset Performance

JavaScript bundles, image assets, web fonts, and OTA update packages delivered through Azure Front Door CDN are cached at edge PoPs globally. Cache hit ratio for static assets typically exceeds 95% in production. Mobile clients downloading a 2MB JS bundle from a geographically proximate PoP experience download times measured in hundreds of milliseconds versus seconds from a single-origin datacenter, directly improving first-launch experience for new users.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

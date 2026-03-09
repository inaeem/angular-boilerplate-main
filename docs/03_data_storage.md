# Data Storage

> Relational databases, distributed caching, object storage, document storage, search, and mobile offline data with synchronisation patterns.

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

## Relational Database

_The authoritative transactional store for structured application data. Covers HA topology, backup strategy, connection pooling, and horizontal read scaling._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Primary Relational DB** | Authoritative transactional store for structured application data. Azure managed PostgreSQL vs self-managed on VMs. | ⚠️ PostgreSQL self-managed on VMs / bare metal; full control; full ops burden | ✅ Azure Database for PostgreSQL Flexible Server — managed; auto backup; HA failover | ✅ Azure PostgreSQL Flexible Server (cloud zone) + on-prem PostgreSQL for sensitive data |
| **High Availability** | Configuration ensuring the database remains accessible during single-node failure without manual intervention. | ⚠️ Patroni + HAProxy cluster; manual failover setup; DBA expertise required | ✅ Zone-redundant HA built-in; automatic failover < 30s; no DBA config required | ⚠️ Azure PostgreSQL HA (cloud) + Patroni (on-prem); separate HA config per zone |
| **Backup & Recovery** | Capturing consistent snapshots, retaining for a defined period, and restoring a specific point in time. | ⚠️ pgBackRest / Barman; custom S3/NFS target; manual retention policy | ✅ Automated backups; geo-redundant; point-in-time restore; configurable retention | ⚠️ Azure automated backups for cloud DB; pgBackRest for on-prem — dual backup management |
| **Connection Pooling** | Middleware multiplexing many application connections onto fewer PostgreSQL backend connections, preventing exhaustion under high mobile API concurrency. | ⚠️ PgBouncer self-managed sidecar; must be deployed, monitored, upgraded | ✅ PgBouncer on AKS sidecar; or Azure flexible server built-in connection pooling | ⚠️ PgBouncer in both zones; separate config and monitoring per deployment |
| **Read Replicas / Scaling** | Additional PostgreSQL instances serving read-only queries, reducing load on the primary for mobile dashboard and reporting queries. | ⚠️ Streaming replication; manual read replica promotion; DBA-intensive | ✅ Read replicas with 1-click provisioning; auto-lag monitoring; auto-failover option | ✅ Azure read replicas for cloud reads; on-prem replicas for latency-sensitive workloads |

## Caching & Key-Value

_In-memory distributed cache reducing database read load, session storage, and device-local key-value storage for mobile performance._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Distributed Cache** | In-memory data store shared across API server instances providing sub-millisecond retrieval of frequently accessed results. | ⚠️ Redis OSS self-managed on VMs; Sentinel for HA; manual eviction tuning | ✅ Azure Cache for Redis (Managed) — cluster mode; geo-replication; OSS ioredis client | ✅ Azure Cache for Redis (cloud) + Redis OSS (on-prem); same ioredis client for both |
| **Mobile Local KV Storage** | High-performance persistent key-value store embedded within the mobile app. react-native-mmkv wraps MMKV — device-native and backend-agnostic. | ✅ MMKV (react-native-mmkv) on device — platform-native; backend-agnostic | ✅ MMKV (react-native-mmkv) — same regardless of backend deployment model | ✅ MMKV same — backend deployment has no impact on device-side KV storage |
| **Session Store** | Server-side store maintaining authenticated session state across horizontally scaled API instances. | ⚠️ Redis Sentinel; sticky session config on NGINX; manual shard rebalancing | ✅ Azure Cache for Redis with session eviction policies; APIM session management | ⚠️ Redis on cloud for cloud API sessions; on-prem Redis for on-prem API sessions |

## Document & Object Storage

_Binary large object storage for assets and artefacts, JSON document storage for flexible-schema entities, full-text and vector search, and compliance-grade immutable storage._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Object / Blob Storage** | Binary large object storage for user uploads, app assets, OTA bundle archives, and log exports. | ⚠️ MinIO (OSS, S3-compatible) self-managed; erasure coding; monitoring required | ✅ Azure Blob Storage — immutable tier; lifecycle policies; geo-redundancy; 99.9999% SLA | ✅ Azure Blob for cloud assets; MinIO on-prem for sensitive docs — S3 API compatible |
| **Document Storage (NoSQL)** | Schema-flexible JSON document storage for entities with variable structure: notification payloads, user preference trees, feature flag configurations. | ⚠️ MongoDB Community / CouchDB self-managed; manual sharding + replication | ✅ Azure Cosmos DB — globally distributed; multi-model; 99.999% SLA | ✅ Cosmos DB for cloud-side documents; MongoDB on-prem for regulated/sovereign data |
| **Search** | Dedicated full-text, vector, and semantic search engine for mobile content discovery queries. | ⚠️ Elasticsearch self-managed (OSS) or OpenSearch; full control; index management | ✅ Azure AI Search — managed indexing, vector search, semantic ranking | ✅ Azure AI Search for cloud data; Elasticsearch OSS for on-prem indexed content |
| **Compliance / Immutable Storage** | Write-once, read-many storage where records cannot be deleted or modified within a retention period — legally admissible for SOC 2, HIPAA, and financial audit. | ⚠️ MinIO WORM buckets + self-managed retention policies; audit required | ✅ Azure Blob immutable storage policy (WORM) — legally admissible; 0 management | ✅ Blob immutable for cloud compliance artifacts; on-prem WORM for local mandates |

## Mobile Client Data

_Device-embedded database, conflict-free sync engine, and CRDT-based collaborative data patterns enabling offline-first mobile experiences._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Local Database (Offline)** | Full relational database embedded within the mobile app enabling complex queries against locally stored data without network connectivity. | ✅ WatermelonDB + SQLCipher — OSS, device-native; backend-agnostic | ✅ WatermelonDB + SQLCipher — same on device regardless of backend | ✅ WatermelonDB + SQLCipher — same on device regardless of backend |
| **Sync Engine** | Server-side service reconciling local device database state with the canonical backend store. Handles conflict resolution, partial sync, and guaranteed delivery. | ⚠️ Custom sync service self-managed on-prem K8s; conflict resolution app-side | ✅ Custom sync service on AKS; Azure Service Bus for sync event queue | ✅ Sync worker on AKS cloud; routes to cloud DB or on-prem DB based on tenant |
| **CRDT / Collaborative Data** | Conflict-free Replicated Data Types enabling deterministic multi-device merge without a central coordinator for real-time collaboration features. | ✅ Yjs / Automerge OSS; custom WebSocket relay server on-prem; full control | ✅ Yjs OSS + Azure Web PubSub relay; scalable WebSocket without infra management | ✅ Yjs on client; Web PubSub (cloud) or self-hosted Socket relay (on-prem) per policy |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

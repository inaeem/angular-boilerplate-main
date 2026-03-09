# Data Storage

> Relational databases, distributed caching, object storage, mobile offline data, and synchronisation patterns that form the persistence layer of the enterprise mobile platform.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Relational Database

### Primary Relational DB

The authoritative transactional store for structured application data including user profiles, audit records, and domain entities. PostgreSQL is the OSS standard: Azure Database for PostgreSQL Flexible Server provides a fully managed PostgreSQL surface with automatic minor-version patching, built-in backup, and configurable zone-redundant HA. Self-managed PostgreSQL on VMs retains full configuration control but requires dedicated DBA operations.

### High Availability

The configuration ensuring the database remains accessible during single-node failure without manual intervention. Azure PostgreSQL Flexible Server zone-redundant HA maintains a synchronous standby in a separate availability zone; automatic failover completes in under 30 seconds with no DBA action required. On-premises achieves HA via Patroni (leader election) + HAProxy (connection routing), requiring operational expertise to configure, test, and operate.

### Backup & Recovery

The process of capturing consistent database snapshots, retaining them for a defined period, and restoring a specific point in time when required. Azure PostgreSQL provides automated geo-redundant backups with point-in-time restore to any second within the retention window. On-premises uses pgBackRest or Barman writing to NFS or MinIO, with retention policy enforcement managed through custom cron jobs and periodic restore tests.

### Connection Pooling

Middleware that multiplexes many application connections onto a smaller number of actual PostgreSQL backend connections, preventing connection exhaustion under high mobile API concurrency. PgBouncer in transaction-mode pooling is the standard. In cloud AKS it runs as a sidecar; Azure PostgreSQL Flexible Server includes built-in connection pooling as a configuration toggle, removing the need for a separately deployed component.

### Read Replicas / Scaling

Additional PostgreSQL instances that replicate from the primary and serve read-only queries, reducing load on the primary and improving read throughput for mobile dashboard and reporting queries. Azure PostgreSQL supports read replicas with one-click provisioning, automated lag monitoring, and optional promotion to primary. On-premises requires configuring streaming replication manually and scripting promotion procedures.

## Caching & Key-Value

### Distributed Cache

An in-memory data store shared across API server instances, providing sub-millisecond retrieval of frequently accessed results. Azure Cache for Redis (managed) supports cluster mode and geo-replication. For mobile workloads it typically absorbs 60–80% of read load on PostgreSQL for user profile, catalogue, and configuration data. The OSS ioredis client is protocol-compatible with both managed and self-hosted Redis.

### Mobile Local KV Storage

A high-performance persistent key-value store embedded within the mobile application for storing user preferences, cached API responses, and lightweight state. `react-native-mmkv` wraps MMKV, a memory-mapped key-value engine originally developed by WeChat, providing significantly faster read/write throughput than AsyncStorage. This is entirely device-local and independent of backend deployment model.

### Session Store

The server-side store used to maintain authenticated session state or short-lived token metadata across horizontally scaled API instances. Redis is the standard session store: all API pods share one Redis cluster, enabling stateless pod scaling. Azure Cache for Redis provides managed cluster mode with automatic failover. On-premises requires Redis Sentinel or Redis Cluster, configured for HA without platform-managed automation.

## Document & Object Storage

### Object / Blob Storage

Binary large object storage for user-uploaded files, app assets, OTA bundle archives, build artefacts, and log exports. Azure Blob Storage provides 99.99999999999% (11 nines) durability via geo-redundant storage, immutable WORM tier for compliance retention, and lifecycle policies for automatic hot→cool→archive tiering. MinIO (OSS, S3-compatible API) provides equivalent functionality on-premises with full data sovereignty.

### Document Storage (NoSQL)

Schema-flexible JSON document storage for entities with variable structure such as notification payloads, user preference trees, and feature flag configurations. Azure Cosmos DB provides single-digit millisecond reads globally with a 99.999% SLA. MongoDB Community Edition on-premises provides the same document model with full operational control at the cost of managing replication, sharding, and index management in-house.

### Search

A dedicated full-text, vector, and semantic search engine allowing mobile users to query across large content corpora. Azure AI Search provides managed indexing, hybrid BM25+vector retrieval, and semantic ranking without maintaining Elasticsearch infrastructure. On-premises deploys Elasticsearch OSS (7.x) or OpenSearch with index management, shard rebalancing, and snapshot policies as operational responsibilities.

### Compliance / Immutable Storage

A write-once, read-many storage layer where records cannot be deleted or modified within a defined retention period — legally admissible for SOC 2, HIPAA, and financial audit trails. Azure Blob immutable storage policies (WORM) are enforced at the storage-account level and are legally recognised. On-premises uses MinIO WORM buckets with hash-chained manifests, requiring custom audit evidence tooling.

## Mobile Client Data

### Local Database (Offline)

A full relational database embedded within the mobile app, enabling complex query, filtering, and aggregation against locally stored data without network connectivity. WatermelonDB provides a Lazy-loading, high-performance SQLite abstraction with a reactive query model, encrypted at rest via SQLCipher. This layer is entirely on-device and architecturally independent of the backend deployment model.

### Sync Engine

The server-side service that reconciles local device database state with the canonical backend store when connectivity is restored. It must handle multi-device conflict resolution (last-write-wins or CRDTs), partial sync for large datasets, and guaranteed delivery semantics. On-premises runs this as a custom service on K8s; cloud deploys it on AKS with Azure Service Bus providing guaranteed at-least-once event delivery; hybrid routes sync events to cloud DB or on-prem DB based on data classification.

### CRDT / Collaborative Data

Conflict-free Replicated Data Types are data structures that can be merged deterministically across multiple devices without a central coordinator, enabling true multi-device real-time collaboration. Yjs and Automerge are the leading OSS implementations. The server-side relay (Azure Web PubSub or a self-hosted Socket.io cluster) propagates CRDT operations between clients; the merge logic is on-device and backend-agnostic.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

# Infrastructure & Compute

> Server infrastructure, container orchestration, networking topology, and mobile backend services.

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

## Compute Infrastructure

_The physical and virtual compute layer that runs all backend workloads — from raw VM provisioning through container scheduling to serverless event-driven functions._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Primary Compute Model** | The foundational unit of compute. Determines who owns hardware procurement, OS patching, capacity planning, and failure response. | ⚠️ Physical servers / VM clusters managed in-house (VMware, Hyper-V) | ✅ Azure Kubernetes Service (AKS) — managed control plane, Azure-hosted nodes | ✅ AKS (cloud) for internet-facing workloads + on-prem VMs/K8s for sensitive compute |
| **Container Orchestration** | Schedules, scales, heals, and manages containerised workloads. Operational burden differs sharply between self-managed and managed K8s. | ⚠️ Self-managed Kubernetes (kubeadm) or OpenShift on bare-metal / VMware | ✅ AKS with managed node upgrades, Azure CNI networking, AAD RBAC | ✅ AKS (cloud zone) + on-prem K8s or OpenShift — unified via Azure Arc |
| **Serverless / Event-Driven Compute** | Workloads billed at invocation level with no persistent infrastructure. Enables burst capacity at zero idle cost. | ❌ Not natively available without additional OSS tooling (OpenFaaS, Knative) | ✅ Azure Container Apps (serverless K8s) + Azure Functions for event-driven tasks | ⚠️ Azure Container Apps for cloud; on-prem retains full-process containers only |
| **Autoscaling** | Capacity increases or decreases automatically in response to demand signals such as CPU, queue depth, or HTTP request rate. | ⚠️ Manual or HPA on self-managed K8s; requires dedicated ops configuration | ✅ HPA + KEDA (event-driven autoscaling) + Cluster Autoscaler — fully managed | ⚠️ KEDA in cloud zone; static capacity in on-prem zone — asymmetric scaling |
| **Multi-Region / HA** | Ability to withstand an availability zone or full datacenter failure without user-visible impact. | ❌ Active-passive DC pairs; complex failover; high capex for second DC | ✅ Azure Availability Zones (free) + Azure Front Door for global routing | ⚠️ Cloud zone multi-AZ + on-prem as warm standby; asymmetric DR complexity |
| **Hardware Procurement Lead Time** | Elapsed time between a decision to add capacity and that capacity being available. Critical during unexpected growth events. | ❌ 8–26 weeks for new server hardware; blocks rapid scaling | ✅ Immediate provisioning via API/portal — seconds to minutes | ⚠️ Cloud scales instantly; on-prem bounded by existing hardware floor |
| **Hardware Refresh Cycle** | Periodic replacement of aging server hardware to maintain performance, security patch eligibility, and vendor support. | ❌ Every 3–5 years; CapEx planning required; risk of obsolescence | ✅ No hardware ownership; Azure continuously refreshes underlying infrastructure | ⚠️ Cloud portion: no refresh. On-prem portion: 3–5 year cycle still required |
| **Edge / On-Device Compute** | Computation placed physically close to users or at the network edge, enabling on-device model inference and local sync without round-tripping. | ✅ Full control of edge hardware; custom edge K8s clusters possible | ✅ Azure IoT Edge + Azure Arc for edge extensions of cloud workloads | ✅ Arc-enabled on-prem nodes act as edge for mobile sync and caching |

## Networking

_Traffic routing topology from mobile client through CDN, WAF, load balancers, API gateways, and into backend services — including private connectivity and DDoS protection._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Network Architecture** | Overall topology governing how traffic flows between mobile clients, internet, CDN, load balancers, API gateways, and backend services. | ✅ Private MPLS / SD-WAN; full control of routing, firewall, QoS policies | ✅ Azure Virtual Network (VNet) + Azure Front Door + Application Gateway WAF | ✅ ExpressRoute / VPN Gateway bridges on-prem network to Azure VNet |
| **Mobile Client Ingress** | The path a mobile HTTPS request travels from device to application logic. Three tiers provide global DDoS, OWASP enforcement, and TLS termination. | ⚠️ Reverse proxy (NGINX/HAProxy) behind on-prem firewall + WAF appliance | ✅ Azure Front Door (global anycast + WAF) → App Gateway WAF v2 → AKS NGINX | ✅ Front Door global → App Gateway cloud zone → ExpressRoute → on-prem services |
| **API Gateway** | Enforces contract, authentication, rate limiting, and routing for all API traffic. External and internal gateways serve different trust domains. | ⚠️ Kong (self-managed) or NGINX Plus; full config control; ops overhead high | ✅ Azure API Management (managed) externally + Kong internally on AKS | ⚠️ APIM cloud + on-prem Kong; dual-gateway routing via VPN/ExpressRoute |
| **Service Mesh (East-West mTLS)** | Mutual TLS encryption and traffic policy between microservices inside the cluster. Automatic cert rotation without code changes. | ⚠️ Istio self-managed on bare-metal K8s; complex cert rotation; high ops burden | ✅ Istio via Azure Service Mesh managed add-on; Microsoft manages control plane | ⚠️ Azure Service Mesh in cloud zone; self-managed Istio on-prem — dual meshes |
| **CDN / Static Asset Delivery** | Globally distributed edge nodes caching and serving static assets close to users, reducing load time for international mobile users. | ⚠️ On-prem CDN appliance (Varnish, Squid) or commercial CDN; limited PoPs | ✅ Azure Front Door CDN — 150+ global PoPs; zero infrastructure to manage | ✅ Azure Front Door for public assets; internal on-prem cache for internal apps |
| **Private Connectivity to Mobile Backend** | Ensures traffic between API servers and downstream data stores never traverses the public internet. | ✅ Direct private network — lowest latency for internal apps on corporate Wi-Fi | ✅ Azure Private Endpoints — all service traffic stays on Azure backbone; no internet | ✅ ExpressRoute for on-prem to cloud; Private Endpoints within Azure zone |
| **DDoS Protection** | Defence against volumetric denial-of-service attacks targeting the mobile API surface. | ⚠️ On-prem WAF + ISP-level DDoS scrubbing; limited capacity; high cost | ✅ Azure DDoS Protection Standard — always-on; Microsoft absorbs attack capacity | ⚠️ Front Door + Azure DDoS protects cloud edge; on-prem still needs separate DDoS |

## Mobile Backend Services

_Specialised server-side services that mobile apps depend on directly: BFF aggregation, push notification fan-out, real-time WebSocket, and over-the-air update delivery._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Backend for Frontend (BFF)** | Server-side aggregation layer purpose-built for the mobile client contract, shaping and batching queries to protect downstream microservices. | ⚠️ Apollo Server / Node.js on self-managed K8s; full control; high ops overhead | ✅ Apollo Server on AKS or Azure Container Apps; KEDA autoscaling; managed infra | ✅ BFF on AKS cloud zone; sensitive BFFs optionally on-prem behind ExpressRoute |
| **Push Notification Infrastructure** | Server-side component for reliably delivering push notifications to iOS (APNs) and Android (FCM) at scale. | ❌ Self-hosted push relay (custom FCM/APNs proxy); complex cert management | ✅ Azure Notification Hubs — managed FCM + APNs fan-out; tag-based targeting | ✅ Notification Hubs cloud; on-prem service triggers push via Event Hubs bridge |
| **Real-Time WebSocket** | Persistent bidirectional connections for live data feeds, collaborative editing, and chat within the mobile app. | ⚠️ Socket.io on self-managed Node.js; sticky sessions; manual horizontal scaling | ✅ Azure Web PubSub — managed WebSocket; auto-scales; OSS client SDK | ✅ Web PubSub (cloud zone) or self-hosted Socket relay (on-prem) per policy |
| **OTA Mobile Updates** | Over-the-air delivery of JavaScript bundle updates to deployed React Native apps, bypassing app store review for JS-only changes. | ⚠️ Self-hosted EAS Update server (oss.expo.dev) or custom CDN; ops required | ✅ EAS Update (Expo managed) + Azure Blob CDN for JS bundle hosting | ✅ EAS Update for cloud delivery; internal apps may use on-prem update server |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

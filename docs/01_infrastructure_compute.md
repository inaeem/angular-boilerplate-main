# Infrastructure & Compute

> Server infrastructure, container orchestration, networking topology, and mobile backend services that underpin the enterprise mobile platform.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Compute Infrastructure

### Primary Compute Model

The foundational unit of compute — physical servers, virtualised machines, or managed Kubernetes nodes. Determines who owns hardware procurement, OS patching, capacity planning, and failure response. On-premises gives maximum physical control; cloud delegates all of this to the provider; hybrid splits responsibility at a defined boundary.

### Container Orchestration

The system that schedules, scales, heals, and manages containerised workloads. Kubernetes is the de facto standard, but the operational burden of running it differs sharply: self-managed kubeadm on bare metal carries full control-plane responsibility, whereas Azure Kubernetes Service (AKS) manages the control plane and node OS upgrades on your behalf.

### Serverless / Event-Driven Compute

Workloads billed and scaled at the invocation or request level, with no persistent infrastructure to manage. Enables burst capacity at zero idle cost. On-premises cannot offer true serverless natively without additional tooling (OpenFaaS, Knative). Azure Container Apps and Azure Functions provide managed serverless runtimes that scale to zero.

### Autoscaling

The ability for compute capacity to increase or decrease automatically in response to demand signals such as CPU utilisation, queue depth, or HTTP request rate. KEDA (Kubernetes Event-Driven Autoscaling) enables scale-to-zero on AKS driven by Azure Service Bus queue depth — a pattern not available on self-managed on-prem without equivalent OSS plumbing.

### Multi-Region / HA

Whether the architecture can withstand an availability zone or full datacenter failure without user-visible impact. Azure Availability Zones provide free multi-zone redundancy within a region; a second physical on-premises datacenter represents significant capital expenditure. Hybrid allows the cloud zone to be multi-AZ while the on-prem zone remains single-site.

### Hardware Procurement Lead Time

The elapsed time between a decision to add capacity and that capacity being available to the platform. Server hardware procurement typically takes 8–26 weeks end-to-end including delivery, rack installation, and OS baseline. Cloud provisioning via API is measured in seconds. This difference is critical during unexpected growth events or product launches.

### Hardware Refresh Cycle

The periodic replacement of aging server hardware to maintain performance, security patch eligibility, and vendor support. On-premises environments require a planned CapEx refresh approximately every 3–5 years. Cloud providers continuously refresh the underlying physical infrastructure transparently, with no disruption or cost to the tenant.

### Edge / On-Device Compute

Computation placed physically close to users or at the network edge, reducing latency for time-sensitive workloads. On-premises can operate fully air-gapped edge clusters. Azure IoT Edge and Azure Arc extend cloud management to edge hardware. For mobile platforms this enables on-device model inference (Phi-4-mini via ONNX Runtime) and local sync without round-tripping to a central region.

## Networking

### Network Architecture

The overall topology governing how traffic flows between mobile clients, the internet, CDN, load balancers, API gateways, and backend services. On-premises uses private MPLS or SD-WAN under direct control. Azure uses Virtual Networks, peering, and Front Door for global routing. Hybrid connects both planes via ExpressRoute or VPN Gateway.

### Mobile Client Ingress

The path that a mobile client's HTTPS request travels from device to application logic. The three-tier Azure pattern (Front Door → Application Gateway WAF v2 → AKS NGINX ingress) provides global DDoS scrubbing, OWASP rule enforcement, and TLS termination at each layer. On-premises achieves similar depth through on-prem WAF appliances but with higher operational ownership.

### API Gateway

The component that enforces contract, authentication, rate limiting, and routing for all API traffic. Azure API Management (APIM) provides a fully managed external gateway with built-in JWT validation, quota, and developer portal. Kong OSS handles east-west internal routing within the cluster. On-premises runs both Kong instances self-managed, increasing operational surface.

### Service Mesh (East-West mTLS)

Mutual TLS encryption and traffic policy enforcement between microservices inside the Kubernetes cluster. Istio, operating as the Azure Service Mesh managed add-on, provides automatic certificate rotation, traffic shaping, and observability without code changes. Self-managing Istio on bare-metal Kubernetes requires manual control-plane upgrades and certificate authority configuration.

### CDN / Static Asset Delivery

The network of globally distributed edge nodes that caches and serves static assets (JS bundles, images, fonts) close to users. Azure Front Door's 150+ global Points of Presence reduce asset load time for international mobile users. On-premises CDN appliances (Varnish, Squid) have limited geographic reach and require hardware at each location.

### Private Connectivity to Mobile Backend

The mechanism ensuring traffic between mobile API servers and downstream data stores never traverses the public internet. Azure Private Endpoints bind managed services (PostgreSQL, Redis, Service Bus) to a private IP inside the VNet. On-premises achieves equivalent isolation through physical network separation. ExpressRoute provides a dedicated private circuit bridging the two in hybrid.

### DDoS Protection

Defence against volumetric denial-of-service attacks targeting the mobile API surface. Azure DDoS Protection Standard provides always-on mitigation backed by Microsoft's global network capacity — absorbing attacks that would saturate a typical on-premises ISP connection. On-premises relies on ISP-level scrubbing and WAF appliances with limited mitigation headroom.

## Mobile Backend Services

### Backend for Frontend (BFF)

A server-side aggregation layer purpose-built for the mobile client contract. Built with Apollo Server (GraphQL), the BFF shapes, batches, and caches queries to protect downstream microservices from the chatty request patterns typical of mobile UX. On-premises hosts this on self-managed Kubernetes; cloud uses AKS or Azure Container Apps with KEDA autoscaling; hybrid may co-locate some BFF instances on-prem for ultra-low-latency internal use cases.

### Push Notification Infrastructure

The server-side component responsible for reliably delivering push notifications to iOS (APNs) and Android (FCM) devices at scale. Azure Notification Hubs provides a managed fan-out abstraction handling credential rotation, per-platform protocol differences, and tag-based audience targeting. Self-hosted push relays require managing APNs certificates, FCM credentials, and horizontal scaling of the relay service.

### Real-Time WebSocket

Persistent bidirectional connections used for live data feeds, collaborative editing, and chat within the mobile app. Azure Web PubSub provides managed WebSocket infrastructure that scales horizontally without sticky-session configuration. On-premises requires Socket.io or uWebSockets behind a load balancer with session affinity — a complex operational setup under high connection counts.

### OTA Mobile Updates

Over-the-air delivery of JavaScript bundle updates to deployed React Native apps, bypassing app store review for JS-only changes. EAS Update (Expo managed) handles bundle signing, CDN distribution, and update channel targeting. Self-hosting requires running the open-source EAS Update server on your own infrastructure with Azure Blob or MinIO as the bundle store.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

# Decision Guide

> Strategic advantages, risk assessment, and a structured framework for choosing between on-premises, cloud-native, and hybrid deployment models for the enterprise mobile platform.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Strategic Advantages

### Data Sovereignty

Data sovereignty defines who has physical and legal control over data at rest. On-premises provides the strongest sovereignty guarantee: data never leaves a specific building or jurisdiction without an explicit operator action, making it the only viable option for classified government and national security workloads. Azure enforces data residency through region selection and Microsoft's contractual commitments, but the CSP retains logical access through the shared-responsibility model. Hybrid tiering — placing highest-classification data on-premises while using cloud for non-sensitive data — is the pragmatic approach for mixed-regulation enterprise environments.

### Vendor Independence

The degree to which the architecture can be migrated away from a specific vendor without rebuilding the application. An OSS-first on-premises stack (Keycloak, PostgreSQL, Redis, Prometheus, ArgoCD) is maximally portable — every component runs on any Kubernetes cluster on any cloud or on-premises environment. Azure-native services (Notification Hubs, Web PubSub, APIM) create switching friction, partially mitigated by the use of OSS application-layer abstractions (OTel, ioredis, AMQP). Hybrid retains the on-premises leg as a cloud-exit lever.

### Operational Control

The granularity of control the organisation has over every layer of the infrastructure stack. On-premises provides maximum control: kernel parameters, network routing tables, storage RAID configuration, and JVM heap settings are all configurable. Cloud delegates infrastructure control to the provider under a shared-responsibility model — the organisation controls the application and configuration layer, Microsoft controls the host OS and hardware. For enterprise mobile platforms, the majority of operational value is in the application layer, making the cloud trade-off strongly favourable for most teams.

### Regulatory Fit (Highly Regulated)

Specific regulations — FedRAMP High, IL5/IL6 government classifications, HIPAA with air-gap requirements, FINRA for trading platforms — may explicitly require or strongly prefer on-premises or sovereign cloud deployments. Azure Government and Azure Sovereign regions (China, Germany) address many of these requirements. Hybrid satisfies mixed requirements: a healthcare platform might process PHI on-premises while running analytics in cloud.

### Time to Market

The calendar time from architectural decision to first production deployment. Cloud provisioning via OpenTofu completes in minutes; an on-premises deployment from hardware procurement to first pod running takes 8–26 weeks. For new product development, this gap is the most significant strategic factor — it determines whether an MVP can be validated in weeks or quarters.

### Innovation Velocity

The speed at which the platform team can adopt new capabilities. Azure continuously releases new managed service features — Azure Container Apps upgrades, new APIM policies, Web PubSub enhancements — that are immediately available to all tenants. On-premises equivalents require self-hosting new OSS releases, validating upgrades, and managing breaking changes. Hybrid enables cloud-first adoption of new capabilities while maintaining the on-prem leg for stable, regulated workloads.

### Mobile Developer Experience

The day-to-day experience of engineers building and testing mobile features. Cloud CI runners provide fast, pre-warmed build environments without the queue times that accumulate on shared self-hosted runner fleets. EAS Build eliminates macOS build agent maintenance entirely. Azure Static Web Apps provides instant Storybook preview deployments without infrastructure configuration. These DX improvements compound: faster feedback loops directly improve feature velocity and reduce bug cycle time.

## Strategic Risks

### Single Point of Failure Risk

The probability and impact of a single infrastructure failure taking down the mobile platform for users. On-premises single-DC deployments are vulnerable to power, cooling, network, and hardware failures with limited automated recovery. Azure Availability Zones provide physical separation within a region with SLAs of 99.9–99.99% per service. Azure Front Door provides automatic failover across regions. Hybrid isolates failure domains: an on-premises outage does not affect the cloud zone and vice versa, provided routing logic handles zone failure gracefully.

### Vendor Lock-in Risk

The risk that dependence on a specific vendor's services prevents migration without prohibitive cost or effort. Azure-native services (Notification Hubs, Web PubSub, APIM, Entra ID) each have switching costs. This risk is actively mitigated in the architecture: OTel (vendor-neutral observability), ioredis (standard Redis protocol), OpenTofu (IaC portable to other clouds), ArgoCD (K8s GitOps standard), and PostgreSQL (portable OSS database). The OSS-first application layer means Azure is primarily an infrastructure concern, not an application concern.

### Talent Availability Risk

The difficulty of hiring and retaining engineers with the specific skills required to operate the platform. On-premises Kubernetes and VMware infrastructure skills are increasingly scarce as the industry has migrated to cloud-managed services. Azure skills (AKS, APIM, Entra ID) are widely represented in the current engineering talent market. Hybrid compounds the problem by requiring engineers proficient in both models — a significantly smaller talent pool than either individually.

### Operational Toil Risk

The accumulation of repetitive, manual operational work that does not contribute to product features: certificate renewals, Kubernetes node upgrades, hardware replacements, OS patching, and database vacuuming. Sustained toil degrades team morale, increases attrition, and consumes capacity that should be directed at platform capability. Cloud managed services eliminate large categories of toil. Hybrid doubles the operational surface area — the team must manage Azure services AND on-premises infrastructure simultaneously.

### Cost Overrun Risk

The risk that actual infrastructure costs significantly exceed budget. On-premises over-provisioning is common (hardware must be sized for peak, which may be rare) but costs are relatively predictable after hardware purchase. Cloud costs are elastic and can spike unexpectedly due to runaway autoscaling, accidental large data transfers, or misconfigured logging verbosity. Azure Cost Management anomaly alerts and budget alerts mitigate this. Hybrid requires managing two separate cost models with different predictability characteristics.

### Security Patch Latency Risk

The window of exposure between a security vulnerability being publicly disclosed and a patch being applied to all affected infrastructure. Azure applies patches to managed infrastructure automatically and transparently, often before CVEs are publicly disclosed under coordinated disclosure programmes. On-premises teams must monitor vulnerability feeds, schedule maintenance windows, and apply patches manually — a process that realistically takes days to weeks for non-critical CVEs, leaving a known exposure window.

## Decision Guide — When To Choose Each

### Recommended When…

**On-Premises**: The workload has an air-gap requirement (classified government, national security); regulation explicitly prohibits data leaving a sovereign physical location; a significant datacenter investment was made less than 2 years ago; or the organisation has deep in-house infrastructure expertise and no cloud mandate. **Cloud (Azure)**: Greenfield enterprise mobile project; startup or rapidly scaling product; global user base with diverse latency requirements; team size under 10 engineers; desire to maximise product feature velocity over infrastructure control. **Hybrid**: Organisation is mid-migration from on-premises to cloud; legacy on-premises systems (ERP, mainframe, hospital PACS) must be integrated into the mobile platform; tiered data sovereignty applies (some data regulated, some not); organisation needs to demonstrate cloud ROI to stakeholders while maintaining regulatory compliance.

### Not Recommended When…

**On-Premises**: The mobile app targets a global consumer audience; the platform engineering team is fewer than 3 FTEs; the organisation has no existing infrastructure competency; rapid product iteration is a strategic priority. **Cloud**: The workload is classified or requires air-gap isolation; jurisdiction law prohibits any data processing outside sovereign territory; a specific compliance regime with no cloud annexe applies. **Hybrid**: The use case is simple and the team is small — the architectural complexity and dual operational overhead of hybrid is rarely justified without a clear, ongoing regulatory or integration driver.

### 3–5 Year Sustainability Assessment

**On-Premises**: Moderate — hardware refresh at year 3–4 requires CapEx planning; talent risk increases as the industry continues moving cloud-native; the operational burden compounds as the platform grows. Viable with a committed, senior infrastructure team and a regulatory mandate. **Cloud**: High — Azure's managed service roadmap continuously reduces operational burden; OSS-first application choices protect against Azure lock-in; the architecture can adopt new capabilities (KEDA event sources, new Istio features) without infrastructure changes. **Hybrid**: High if actively governed — complexity must be treated as technical debt, not architectural permanence; the hybrid model is most sustainable when it is explicitly a transitional state with a defined migration path, or when the regulatory requirement driving it is expected to persist for the full 3–5 year horizon.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

# Identity & Security

> Identity providers, authentication protocols, secrets management, zero-trust posture, data protection controls, and network security layers.

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

## Identity & Access Management

_Controls governing who can authenticate to the platform, how tokens are issued and validated, how device posture is asserted, and how service-to-service calls are secured without static credentials._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Identity Provider (IdP)** | Authoritative system issuing identity tokens, enforcing MFA, and managing user lifecycles. | ⚠️ Keycloak (OSS) self-managed on-prem; full data sovereignty; high ops burden | ✅ Microsoft Entra ID — managed; Conditional Access; deep M365/Intune integration | ✅ Entra ID (cloud) federated to on-prem Keycloak or AD DS via OIDC/SAML bridge |
| **Auth Protocol** | Wire-level specification governing how mobile clients obtain, refresh, and present identity tokens. PKCE prevents code interception; PAR prevents redirect manipulation. | ✅ OAuth 2.0 + OIDC + PKCE + PAR — protocol is platform-independent | ✅ OAuth 2.0 + OIDC + PKCE + PAR via Entra ID; PAR enforced at APIM policy layer | ✅ Same protocols; cloud IdP issues tokens; on-prem services validate via JWKS URI |
| **Mobile Auth SDK** | Client-side library orchestrating the OAuth2/OIDC flow including token acquisition, refresh, broker handoff, and Conditional Access compliance. | ⚠️ react-native-msal (Keycloak compat) or AppAuth (OSS); manual broker wiring | ✅ react-native-msal — MSAL wraps Entra ID natively; broker auth + Conditional Access | ✅ react-native-msal pointing to Entra ID; on-prem services accept same JWT claims |
| **MDM / Device Compliance Integration** | MDM policy signals (jailbreak status, OS version, encryption state) injected into the auth flow as token claims. | ⚠️ Manual MDM policy push via Intune/Jamf; device compliance checked app-side | ✅ Intune device compliance → Entra Conditional Access → token scope reduction | ✅ Intune cloud feeds Conditional Access; on-prem resources validate via token claims |
| **Service-to-Service Auth** | How backend microservices authenticate to each other and to managed data services without storing static credentials. | ❌ mTLS client certs or static shared secrets; manual rotation; high toil | ✅ Azure Managed Identity — no credentials, no rotation; MSI tokens via IMDS | ⚠️ Managed Identity for cloud services; on-prem services use client certs or Vault |
| **Secrets Management** | System responsible for storing, rotating, and auditing access to sensitive runtime values: connection strings, API keys, signing keys. | ⚠️ HashiCorp Vault (OSS) self-managed; excellent control; significant ops overhead | ✅ Azure Key Vault (HSM-backed) + Secrets Store CSI Driver; zero credentials in code | ✅ Key Vault cloud for AKS workloads; Vault on-prem for on-prem services; dual sync |
| **Certificate Management** | Lifecycle management of TLS certificates for ingress, inter-service mTLS, and mobile certificate pinning. | ⚠️ Internal CA (CFSSL / cert-manager); manual rotation cycles; risk of expiry | ✅ Key Vault + DigiCert integration; auto-renewal; rotation events trigger pipelines | ⚠️ Key Vault for cloud certs; internal CA for on-prem; ExpressRoute carries trust |
| **Zero Trust Implementation** | No request — regardless of network origin — is implicitly trusted. Every call must present verifiable identity and device posture. | ⚠️ Manual policy configuration; no native posture scoring; high architectural toil | ✅ Entra ID Conditional Access + Defender for Cloud continuous posture scoring | ✅ Conditional Access for cloud; on-prem resources added to Zero Trust scope via Arc |

## Data Security

_Encryption controls protecting data at rest on servers, in transit across the network, on mobile devices, and at the binary level through RASP and obfuscation._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Encryption at Rest (Server-Side)** | Protection of data when written to persistent storage so raw disk access yields unintelligible ciphertext. | ⚠️ LUKS disk encryption; TDE on PostgreSQL; key management via Vault HSM plugin | ✅ Azure Storage encryption (AES-256, platform-managed or CMK via Key Vault) | ✅ Azure encryption for cloud storage; LUKS/TDE for on-prem — dual key hierarchy |
| **Encryption in Transit** | Protection of data moving between components — client to API edge, between microservices, and application to database. | ⚠️ TLS 1.3 at load balancer; cert-manager in K8s; manual rotation schedule | ✅ TLS 1.3 at Azure Front Door; mTLS via Istio service mesh; Key Vault auto-renewal | ✅ Front Door TLS + Istio cloud; ExpressRoute private link + TLS for on-prem segment |
| **Mobile Device Encryption at Rest** | Protection of data stored on the mobile device. iOS Keychain, Android Keystore, SQLCipher, and MMKV are device-native and backend-agnostic. | ✅ iOS Keychain + Android Keystore (platform-native — same regardless of backend) | ✅ iOS Keychain + Android Keystore; expo-secure-store; SQLCipher; MMKV | ✅ Same platform-native device encryption — backend deployment has no impact |
| **Certificate Pinning (Mobile)** | Binding the mobile client to a specific CA intermediate to prevent MITM attacks even when a rogue CA is trusted by the OS. | ✅ react-native-ssl-pinning; pin to on-prem reverse proxy intermediate CA | ✅ react-native-ssl-pinning; pin to Azure Front Door intermediate CA | ⚠️ Dual pins: one for cloud (Front Door CA) one for on-prem (internal CA) |
| **RASP / Binary Protection** | Runtime Application Self-Protection and binary hardening to resist reverse engineering, tampering, and replay attacks. | ✅ GuardSquare DexGuard/iXGuard + Approov — cloud-agnostic; same regardless | ✅ GuardSquare + Approov; Approov tokens validated at APIM policy layer | ✅ Same RASP tools; Approov tokens validated at cloud APIM; on-prem validates via API |
| **Data Loss Prevention (DLP)** | Automated detection and blocking of sensitive data leaving the organisation through unauthorised channels. | ⚠️ OpenDLP (OSS) or commercial DLP appliance; limited cloud data coverage | ✅ Microsoft Purview DLP + Defender for Cloud Apps; native cloud data scanning | ⚠️ Purview covers Azure storage; on-prem data requires additional DLP agent coverage |

## Network Security

_Defensive layers at the network perimeter and within the service mesh: WAF rule enforcement, intrusion detection, and supply chain integrity controls._

| Criterion | Description | 🏢 On-Premises | ☁️ Cloud (Azure + OSS) | 🔀 Hybrid |
|---|---|---|---|---|
| **Web Application Firewall (WAF)** | Layer-7 inspection blocking OWASP Top 10 attacks including SQL injection, XSS, and path traversal. | ⚠️ ModSecurity / NGINX WAF on self-managed reverse proxy; OWASP CRS ruleset | ✅ Azure Front Door WAF + Application Gateway WAF v2 (OWASP CRS 3.3); managed rules | ✅ Front Door WAF for public traffic; on-prem WAF appliance for internal-only traffic |
| **Intrusion Detection / Prevention** | Network and host-level monitoring for indicators of compromise, lateral movement, and anomalous access patterns. | ⚠️ Suricata / Snort IDS on network perimeter; Wazuh SIEM integration | ✅ Microsoft Defender for Cloud + Sentinel SIEM; ML-based anomaly detection | ✅ Defender for Cloud cloud zone; Sentinel ingests on-prem logs via Log Analytics agent |
| **Supply Chain Security** | Controls protecting integrity of third-party code, container images, and build artefacts throughout the delivery pipeline. | ✅ Socket.dev + Trivy + Cosign + CycloneDX — OSS tools, backend-agnostic | ✅ Same OSS tools; ACR (Azure Container Registry) natively supports Cosign/Notation | ✅ Same tools; ACR for cloud images; on-prem Harbor registry for on-prem images |

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

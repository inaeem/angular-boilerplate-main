# Identity & Security

> Identity providers, authentication protocols, secrets management, zero-trust posture, data protection controls, and network security layers for the enterprise mobile platform.

---

## Deployment Model Key

| Badge | Deployment Model |
|---|---|
| ![On-Premises](https://img.shields.io/badge/On--Premises-1F4E79?style=flat-square&logoColor=white) | On-Premises — self-managed infrastructure within your datacentre |
| ![Cloud](https://img.shields.io/badge/Cloud%20(Azure%20%2B%20OSS)-833C00?style=flat-square&logoColor=white) | Cloud — Azure-native managed services + OSS application layer |
| ![Hybrid](https://img.shields.io/badge/Hybrid-375623?style=flat-square&logoColor=white) | Hybrid — cloud for internet-facing workloads, on-prem for regulated/legacy |

---

## Identity & Access Management

### Identity Provider (IdP)

The authoritative system that issues identity tokens, enforces MFA, and manages user lifecycles. Microsoft Entra ID integrates natively with Microsoft 365, Intune, and Conditional Access — the three pillars of enterprise mobile posture management. Keycloak (OSS) can replicate this on-premises but requires manual connector development and lacks the native Intune device compliance signal integration.

### Auth Protocol

The wire-level specification governing how mobile clients obtain, refresh, and present identity tokens. OAuth 2.0 with OIDC, PKCE (Proof Key for Code Exchange), and PAR (Pushed Authorization Requests) is the current security baseline for public mobile clients. PKCE prevents authorisation code interception; PAR prevents redirect URI manipulation. These are open standards independent of backend deployment model.

### Mobile Auth SDK

The client-side library that orchestrates the OAuth2/OIDC flow from within the React Native application, including token acquisition, refresh, broker handoff (iOS Authenticator, Android Company Portal), and Conditional Access policy compliance. `react-native-msal` wraps Microsoft Authentication Library and provides seamless broker-assisted auth with Entra ID, including device compliance posture propagation into token claims.

### MDM / Device Compliance Integration

The mechanism by which Mobile Device Management (MDM) policy signals — jailbreak status, OS version, encryption state, screen-lock policy — are injected into the authentication and authorisation flow. Microsoft Intune evaluates device compliance and signals Entra ID Conditional Access, which can downscope token claims or require step-up MFA. On-premises models must replicate this via custom middleware consuming MDM APIs.

### Service-to-Service Auth

How backend microservices authenticate to each other and to managed data services without using static credentials. Azure Managed Identity eliminates all service account passwords: a pod presents its MSI token to Key Vault, Service Bus, or PostgreSQL without any credential stored in code, environment variables, or Kubernetes Secrets. On-premises must substitute mTLS client certificates or Vault-issued dynamic credentials, both of which require active rotation management.

### Secrets Management

The system responsible for storing, rotating, and auditing access to sensitive runtime values: database connection strings, API keys, signing keys, and TLS private keys. Azure Key Vault backed by HSMs provides cryptographic key hierarchy with automatic rotation policies and full audit trail. HashiCorp Vault (OSS) provides equivalent capability on-premises but requires dedicated operations for Vault HA, unsealing, and backup.

### Certificate Management

Lifecycle management of TLS certificates for ingress, inter-service mTLS, and mobile certificate pinning. Key Vault integrates with DigiCert for automatic renewal and rotation, with rotation events triggering pipeline restarts to reload new leaf certificates. On-premises uses cert-manager with an internal CA (CFSSL), requiring manual monitoring of expiry windows and rotation runbooks.

### Zero Trust Implementation

The architectural principle that no request — regardless of network origin — is implicitly trusted. Every API call must present a verifiable identity, device posture signal, and contextual access claim. Entra ID Conditional Access combined with Defender for Cloud continuous posture scoring operationalises zero trust across the Azure estate. On-premises zero trust is achievable but requires manual policy orchestration across multiple systems with no unified posture score.

## Data Security

### Encryption at Rest (Server-Side)

Protection of data when written to persistent storage on the server side, such that raw disk access yields unintelligible ciphertext. Azure Storage services apply AES-256 encryption by default using platform-managed keys; Customer-Managed Keys (CMK) via Key Vault provide tenant-controlled key hierarchy for compliance requirements. On-premises uses LUKS full-disk encryption plus PostgreSQL Transparent Data Encryption with Vault as the key manager.

### Encryption in Transit

Protection of data as it moves between components — from mobile client to API edge, between microservices, and from application to database. TLS 1.3 is enforced at Azure Front Door for all client traffic. Istio Service Mesh provides automatic mTLS between all pods in the cluster. Azure Key Vault manages certificate auto-renewal to prevent expiry-induced outages.

### Mobile Device Encryption at Rest

Protection of data stored on the mobile device itself. iOS Keychain and Android Keystore provide hardware-backed secure enclaves for token storage. `expo-secure-store` wraps these platform APIs. WatermelonDB uses SQLCipher for AES-256 encryption of the offline database. MMKV provides encrypted key-value storage. These are entirely device-native capabilities unaffected by backend deployment model.

### Certificate Pinning (Mobile)

Binding the mobile client to a specific TLS certificate or CA intermediate to prevent man-in-the-middle attacks even when a rogue CA is trusted by the OS. `react-native-ssl-pinning` implements SHA-256 public key pinning. Pin management requires careful coordination: hybrid deployments pin to two different intermediates (Front Door CA and on-prem internal CA) and both must be rotated in lockstep with app updates.

### RASP / Binary Protection

Runtime Application Self-Protection and binary hardening measures applied to the compiled mobile app to resist reverse engineering, tampering, and replay attacks. GuardSquare (DexGuard for Android, iXGuard for iOS) applies obfuscation, string encryption, and anti-tamper checks. Approov performs device attestation at runtime, issuing short-lived JWTs that are validated at the API gateway before any request is processed.

### Data Loss Prevention (DLP)

Automated detection and blocking of sensitive data leaving the organisation through unauthorised channels. Microsoft Purview DLP scans Azure storage, OneDrive, and Teams for PII patterns and policy violations. Defender for Cloud Apps provides DLP for SaaS applications. On-premises requires either a commercial DLP appliance or OpenDLP deployment with custom classification rules and manual tuning.

## Network Security

### Web Application Firewall (WAF)

Layer-7 inspection and filtering of HTTP/S traffic to detect and block OWASP Top 10 attacks including SQL injection, XSS, and path traversal. Azure Front Door WAF and Application Gateway WAF v2 both enforce OWASP Core Rule Set 3.3, with managed rule updates applied by Microsoft. On-premises uses ModSecurity or NGINX WAF with OWASP CRS, requiring manual rule version management and false-positive tuning.

### Intrusion Detection / Prevention

Network and host-level monitoring for indicators of compromise, lateral movement, and anomalous access patterns. Microsoft Defender for Cloud provides ML-based anomaly detection across the Azure subscription with native SIEM integration into Microsoft Sentinel. On-premises deploys Suricata or Snort for network IDS and Wazuh as HIDS/SIEM, all of which require dedicated security engineering to operate.

### Supply Chain Security

Controls protecting the integrity of third-party code, container images, and build artefacts throughout the software delivery pipeline. Socket.dev performs behavioural analysis on npm package changes to detect malicious code injection. Trivy scans container images for CVEs. Cosign cryptographically signs images in ACR. CycloneDX generates a Software Bill of Materials (SBOM) per release for auditability and incident response.

---

*Part of the Enterprise Mobile Architecture — On-Premises vs Cloud vs Hybrid comparison series.*

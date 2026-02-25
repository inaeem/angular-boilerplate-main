import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '@env/environment';

export const authConfig: AuthConfig = {
  issuer: environment.oauth.issuer,
  redirectUri: environment.oauth.redirectUri,
  clientId: environment.oauth.clientId,
  responseType: environment.oauth.responseType,
  scope: environment.oauth.scope,
  showDebugInformation: environment.oauth.showDebugInformation,
  requireHttps: environment.oauth.requireHttps,

  // Silent refresh configuration
  silentRefreshRedirectUri: environment.oauth.silentRefreshRedirectUri,
  useSilentRefresh: environment.oauth.useSilentRefresh,
  silentRefreshTimeout: environment.oauth.silentRefreshTimeout,
  timeoutFactor: environment.oauth.timeoutFactor,
  sessionChecksEnabled: environment.oauth.sessionChecksEnabled,

  // Logout configuration
  postLogoutRedirectUri: environment.oauth.postLogoutRedirectUri,

  // Clear hash after login (recommended)
  clearHashAfterLogin: true,

  // Enable PKCE for authorization code flow (recommended for security)
  // This is the modern and more secure approach
  oidc: true,

  // Skip issuer check if your server doesn't support discovery
  // strictDiscoveryDocumentValidation: false,
};

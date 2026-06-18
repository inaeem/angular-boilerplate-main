import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '@env/environment';

/**
 * OIDC client configuration for `angular-oauth2-oidc`.
 *
 * Uses the Authorization Code Flow with PKCE (the recommended flow for SPAs).
 * Endpoint URLs are discovered automatically from the issuer's
 * `.well-known/openid-configuration` document, so only the issuer, client id,
 * scopes and redirect URIs need to be provided here.
 */
export const authConfig: AuthConfig = {
  issuer: environment.oauth.issuer,
  clientId: environment.oauth.clientId,

  // Where the IdP sends the user back to after authentication. Must be
  // whitelisted in the IdP client config. We use the app origin so it works
  // across environments without hardcoding hosts.
  redirectUri: window.location.origin + '/',
  postLogoutRedirectUri: window.location.origin + '/',

  responseType: environment.oauth.responseType, // 'code'
  scope: environment.oauth.scope, // 'openid profile email'

  // PKCE is required for the code flow in public (browser) clients.
  // (Enabled by default for responseType 'code', set explicitly for clarity.)
  // disablePKCE defaults to false.

  // --- Automatic silent refresh via refresh-token rotation ---
  // The `offline_access` scope (set in environment.oauth.scope) makes the IdP
  // issue a refresh token. With code flow, setupAutomaticSilentRefresh() then
  // silently calls the token endpoint with that refresh token before the
  // access token expires — no iframe or silent-refresh.html needed.
  useSilentRefresh: false, // iframe-based silent refresh is for implicit flow; not used here
  // Renew when the access token has used up this fraction of its lifetime (0.75 = at 75%).
  timeoutFactor: 0.75,

  // Allow http issuers (e.g. a local IdP) in development only.
  requireHttps: environment.production ? true : false,

  // Re-validate the session and clean the callback params from the URL.
  clearHashAfterLogin: true,
  showDebugInformation: !environment.production,
};

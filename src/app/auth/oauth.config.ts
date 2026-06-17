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

  // Allow http issuers (e.g. a local IdP) in development only.
  requireHttps: environment.production ? true : false,

  // Re-validate the session and clean the callback params from the URL.
  clearHashAfterLogin: true,
  showDebugInformation: !environment.production,
};

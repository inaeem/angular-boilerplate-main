import { env } from './.env';

export const environment = {
  production: false,
  version: env['npm_package_version'] + '-dev',
  defaultLanguage: 'de-DE',
  supportedLanguages: ['de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT'],
  oauth: {
    issuer: 'https://your-auth-server.com', // Your OAuth2/OIDC issuer URL
    clientId: 'your-client-id', // Your OAuth2 client ID
    redirectUri: window.location.origin + '/login', // Redirect URI after login
    postLogoutRedirectUri: window.location.origin + '/login', // Redirect URI after logout
    scope: 'openid profile email', // Requested scopes
    responseType: 'code', // OAuth2 response type (code for authorization code flow)
    showDebugInformation: true, // Show debug information in console (dev only)
    requireHttps: false, // Set to true in production
    // Optional: Silent refresh
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    useSilentRefresh: true,
    silentRefreshTimeout: 5000,
    timeoutFactor: 0.75,
    sessionChecksEnabled: true,
  },
};

# OAuth2/OIDC Authentication Setup Guide

This project has been configured to use OAuth2/OIDC authentication using `angular-oauth2-oidc` and `angular-oauth2-oidc-jwks`.

## Overview

The authentication system has been migrated from hardcoded credentials to OAuth2/OIDC Authorization Code Flow with PKCE (Proof Key for Code Exchange), which is the recommended and most secure authentication flow for modern web applications.

## Configuration

### 1. Environment Configuration

Update the OAuth2 settings in your environment files:

**Development**: `src/environments/environment.ts`
**Production**: `src/environments/environment.prod.ts`

```typescript
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
}
```

### 2. Required Configuration Steps

1. **Set up your OAuth2/OIDC Provider**:
   - Configure your authorization server (e.g., Keycloak, Auth0, Azure AD, Okta, etc.)
   - Create a client application
   - Configure redirect URIs (must match your application URLs)
   - Note your issuer URL and client ID

2. **Update Environment Variables**:
   - Replace `https://your-auth-server.com` with your actual authorization server URL
   - Replace `your-client-id` with your actual client ID
   - Adjust scopes based on your requirements

3. **Configure Redirect URIs in Authorization Server**:
   - Add `http://localhost:4200/login` for development
   - Add `http://localhost:4200/silent-refresh.html` for silent token refresh
   - Add production URLs when deploying

## How It Works

### Login Flow

1. User clicks "Login" button
2. Application redirects to authorization server
3. User authenticates on authorization server
4. Authorization server redirects back to application with authorization code
5. Application exchanges code for tokens (access token, ID token, refresh token)
6. User information is extracted from ID token
7. User is redirected to dashboard or original requested page

### Token Management

- **Access Token**: Used for API requests (automatically added to HTTP headers)
- **Refresh Token**: Used to obtain new access tokens when they expire
- **ID Token**: Contains user profile information (name, email, roles, etc.)
- **Silent Refresh**: Automatically refreshes tokens in the background before expiration

### Authentication Guard

Protected routes automatically:
- Check for valid access token
- Attempt to refresh expired tokens
- Redirect to login if authentication fails

## Components Updated

### 1. AuthenticationService (`src/app/auth/services/authentication.service.ts`)
- Configured OAuth2/OIDC using `OAuthService`
- Implements Authorization Code Flow with PKCE
- Handles token refresh and validation
- Extracts user information from ID token claims

### 2. LoginComponent (`src/app/auth/login/login.component.ts`)
- Initiates OAuth2 login flow
- Handles OAuth2 callback after authentication
- Extracts credentials from tokens

### 3. CredentialsService (`src/app/auth/services/credentials.service.ts`)
- Integrated with OAuthService for token validation
- Checks both credentials and OAuth2 token validity
- Provides token expiration checks

### 4. ApiPrefixInterceptor (`src/app/@core/interceptors/api-prefix.interceptor.ts`)
- Uses OAuthService to get access tokens
- Automatically adds Bearer token to API requests
- Handles 401 errors with automatic token refresh
- Retries failed requests after token refresh

### 5. Authentication Guards (`src/app/auth/guard/authentication.guard.ts`)
- Updated to check OAuth2 token validity
- Attempts silent token refresh before redirecting to login
- Uses OAuthService for token validation

## Token Refresh

The application implements multiple token refresh strategies:

1. **Automatic Silent Refresh**:
   - Configured in environment settings
   - Refreshes tokens in hidden iframe
   - Happens automatically before expiration

2. **On-Demand Refresh**:
   - Triggered when API returns 401 Unauthorized
   - Retries the failed request with new token

3. **Guard-Level Refresh**:
   - Attempts refresh when accessing protected routes
   - Ensures valid token before page navigation

## User Information Mapping

The ID token claims are mapped to the Credentials entity:

- `sub` → `id` (User ID)
- `preferred_username` or `name` or `email` → `username`
- `email` → `email`
- `given_name` → `firstName`
- `family_name` → `lastName`
- `roles` or `groups` → `roles` (array)

**Note**: Claim names may vary by provider. Adjust mapping in `AuthenticationService._updateCredentialsFromTokens()` if needed.

## Testing

### Testing with Different Providers

**Keycloak**:
```typescript
issuer: 'https://your-keycloak-server/realms/your-realm',
clientId: 'your-client-id',
scope: 'openid profile email roles'
```

**Auth0**:
```typescript
issuer: 'https://your-domain.auth0.com',
clientId: 'your-client-id',
scope: 'openid profile email'
```

**Azure AD**:
```typescript
issuer: 'https://login.microsoftonline.com/your-tenant-id/v2.0',
clientId: 'your-client-id',
scope: 'openid profile email'
```

**Okta**:
```typescript
issuer: 'https://your-domain.okta.com/oauth2/default',
clientId: 'your-client-id',
scope: 'openid profile email'
```

## Debugging

Enable debug logging in development environment:

```typescript
oauth: {
  showDebugInformation: true, // Shows OAuth2 events in console
  // ... other settings
}
```

Check console for:
- Token received events
- Token refresh events
- Discovery document loading
- Authentication errors

## Security Considerations

1. **HTTPS in Production**: Set `requireHttps: true` in production environment
2. **Token Storage**: Tokens are stored by OAuthService (in sessionStorage by default)
3. **PKCE**: Enabled by default for enhanced security
4. **Token Validation**: JWT tokens are validated using JWKS
5. **Silent Refresh**: Prevents token theft via XSS

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Configure CORS on your authorization server
   - Add your application origin to allowed origins

2. **Invalid Redirect URI**:
   - Ensure redirect URIs in environment match those configured in authorization server
   - Check for trailing slashes

3. **Token Refresh Fails**:
   - Verify refresh token is being issued by authorization server
   - Check token expiration times
   - Ensure silent refresh HTML file is accessible

4. **Claims Not Found**:
   - Check ID token structure from your provider
   - Adjust claim mapping in `AuthenticationService._updateCredentialsFromTokens()`

## Additional Resources

- [angular-oauth2-oidc Documentation](https://github.com/manfredsteyer/angular-oauth2-oidc)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [PKCE (Proof Key for Code Exchange)](https://oauth.net/2/pkce/)
- [OpenID Connect Core Specification](https://openid.net/specs/openid-connect-core-1_0.html)

## Migration Notes

The following changes were made during migration:

- Removed hardcoded credentials from `AuthenticationService.login()`
- Login now initiates OAuth2 redirect instead of directly setting credentials
- HTTP interceptor now uses OAuthService to get access tokens
- Guards now validate OAuth2 tokens in addition to stored credentials
- Logout now properly revokes OAuth2 tokens and clears session

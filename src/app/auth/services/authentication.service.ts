import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';

import { CredentialsService } from '@app/auth';
import { Credentials } from '@core/entities';
import { authConfig } from '@core/config/auth.config';

export interface LoginContext {
  username?: string;
  password?: string;
  remember?: boolean;
  isMobile?: boolean;
}

/**
 * Provides OAuth2/OIDC authentication workflow using angular-oauth2-oidc.
 * Implements Authorization Code Flow with PKCE for secure authentication.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private readonly _credentialsService: CredentialsService,
    private readonly _oauthService: OAuthService,
    private readonly _router: Router,
  ) {
    this._configureOAuth();
  }

  /**
   * Configures the OAuth2/OIDC service with authentication settings.
   * Sets up token validation, silent refresh, and loads discovery document.
   */
  private _configureOAuth(): void {
    // Configure OAuth2/OIDC settings
    this._oauthService.configure(authConfig);

    // Use JwksValidationHandler for token validation
    this._oauthService.tokenValidationHandler = new JwksValidationHandler();

    // Load discovery document and try silent refresh
    this._oauthService.loadDiscoveryDocumentAndTryLogin().then((result) => {
      if (result) {
        // User is logged in, set credentials
        this._updateCredentialsFromTokens();
      }

      // Setup automatic silent refresh
      if (authConfig.useSilentRefresh) {
        this._oauthService.setupAutomaticSilentRefresh();
      }
    });

    // Listen to token received events
    this._oauthService.events.subscribe((event) => {
      if (event.type === 'token_received' || event.type === 'token_refreshed') {
        this._updateCredentialsFromTokens();
      }
    });
  }

  /**
   * Initiates the OAuth2/OIDC login flow.
   * Redirects user to the authorization server for authentication.
   * @param context The login parameters (OAuth2 doesn't use username/password directly).
   * @return Observable that emits true when login is initiated.
   */
  login(context: LoginContext = {}): Observable<boolean> {
    // Store remember preference
    if (context.remember !== undefined) {
      localStorage.setItem('rememberMe', context.remember.toString());
    }

    // Initiate code flow (Authorization Code Flow with PKCE)
    this._oauthService.initCodeFlow();

    // Return observable indicating login was initiated
    return of(true);
  }

  /**
   * Handles the OAuth2 callback after successful authentication.
   * Extracts and stores the credentials from the tokens.
   * @return Observable of Credentials
   */
  handleLoginCallback(): Observable<Credentials | null> {
    return from(this._oauthService.loadDiscoveryDocumentAndTryLogin()).pipe(
      map((success) => {
        if (success && this._oauthService.hasValidAccessToken()) {
          return this._updateCredentialsFromTokens();
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error handling login callback:', error);
        return of(null);
      }),
    );
  }

  /**
   * Extracts user information from ID token and access token,
   * then updates the credentials service.
   * @return The extracted credentials
   */
  private _updateCredentialsFromTokens(): Credentials {
    const claims = this._oauthService.getIdentityClaims() as any;
    const accessToken = this._oauthService.getAccessToken();
    const refreshToken = this._oauthService.getRefreshToken();
    const expiresAt = this._oauthService.getAccessTokenExpiration();
    const now = Date.now();
    const expiresIn = expiresAt ? Math.floor((expiresAt - now) / 1000) : 3600;

    // Extract user information from claims
    const credentials: Credentials = new Credentials({
      username: claims?.preferred_username || claims?.name || claims?.email || '',
      id: claims?.sub || '',
      token: accessToken,
      refreshToken: refreshToken || '',
      expiresIn: expiresIn,
      roles: claims?.roles || claims?.groups || [],
      email: claims?.email || '',
      firstName: claims?.given_name || '',
      lastName: claims?.family_name || '',
    });

    // Check if user wants to be remembered
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    this._credentialsService.setCredentials(credentials, rememberMe);

    return credentials;
  }

  /**
   * Logs out the user and clears credentials.
   * Redirects to the OAuth2 logout endpoint if configured.
   * @return Observable that emits true when logout is complete.
   */
  logout(): Observable<boolean> {
    // Clear credentials
    this._credentialsService.setCredentials();

    // Revoke tokens and logout
    this._oauthService.revokeTokenAndLogout();

    return of(true);
  }

  /**
   * Manually refreshes the access token using the refresh token.
   * @return Observable that emits true if refresh was successful.
   */
  refreshToken(): Observable<boolean> {
    return from(this._oauthService.refreshToken()).pipe(
      map(() => {
        this._updateCredentialsFromTokens();
        return true;
      }),
      catchError((error) => {
        console.error('Error refreshing token:', error);
        // If refresh fails, logout user
        this.logout().subscribe();
        return of(false);
      }),
    );
  }

  /**
   * Checks if the user has a valid access token.
   * @return True if the user has a valid access token.
   */
  hasValidToken(): boolean {
    return this._oauthService.hasValidAccessToken();
  }

  /**
   * Gets the current access token.
   * @return The access token or empty string if not available.
   */
  getAccessToken(): string {
    return this._oauthService.getAccessToken();
  }
}

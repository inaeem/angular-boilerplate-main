import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Credentials } from '@core/entities';

const credentialsKey = 'credentials';

/**
 * Provides storage for authentication credentials.
 * Works with OAuth2/OIDC tokens managed by OAuthService.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private _credentials: Credentials | null = null;

  constructor(private readonly _oauthService: OAuthService) {
    // Load saved credentials from storage
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      try {
        this._credentials = JSON.parse(savedCredentials);
      } catch (error) {
        console.error('Failed to parse saved credentials:', error);
        this._clearStoredCredentials();
      }
    }
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }

  /**
   * Checks if the user is authenticated.
   * Verifies both stored credentials and OAuth2 token validity.
   * @return True if the user is authenticated with a valid token.
   */
  isAuthenticated(): boolean {
    // Check if we have credentials and a valid OAuth2 access token
    return !!this._credentials && this._oauthService.hasValidAccessToken();
  }

  /**
   * Gets the current access token from OAuth2 service.
   * @return The access token or empty string if not available.
   */
  getAccessToken(): string {
    return this._oauthService.getAccessToken();
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * Note: OAuth2 tokens are managed separately by OAuthService.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: Credentials, remember = true) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      try {
        storage.setItem(credentialsKey, JSON.stringify(credentials));
      } catch (error) {
        console.error('Failed to save credentials to storage:', error);
      }
    } else {
      this._clearStoredCredentials();
    }
  }

  /**
   * Clears stored credentials from both localStorage and sessionStorage.
   */
  private _clearStoredCredentials(): void {
    sessionStorage.removeItem(credentialsKey);
    localStorage.removeItem(credentialsKey);
  }

  /**
   * Checks if the access token is expired or about to expire.
   * @param bufferSeconds Number of seconds before expiration to consider the token expired (default: 60).
   * @return True if the token is expired or about to expire.
   */
  isTokenExpired(bufferSeconds = 60): boolean {
    const expiresAt = this._oauthService.getAccessTokenExpiration();
    if (!expiresAt) {
      return true;
    }

    const now = Date.now();
    const expiryTime = expiresAt - bufferSeconds * 1000;
    return now >= expiryTime;
  }
}

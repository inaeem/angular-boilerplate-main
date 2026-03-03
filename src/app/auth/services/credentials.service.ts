import { Injectable } from '@angular/core';
import { Credentials } from '@core/entities';

const credentialsKey = 'credentials';

/**
 * Provides storage for authentication credentials.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private _credentials: Credentials | null = null;

  constructor() {
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
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
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
}

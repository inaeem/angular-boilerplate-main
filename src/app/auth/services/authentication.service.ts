import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CredentialsService } from '@app/auth';
import { Credentials } from '@core/entities';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * Provides a base for authentication workflow.
 * Uses dummy authentication for development/demo purposes.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private readonly _credentialsService: CredentialsService) {}

  /**
   * Authenticates the user with dummy credentials.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<Credentials> {
    // Dummy authentication - accepts any username/password
    const credentials: Credentials = new Credentials({
      username: context.username || 'demo',
      id: 'user-123',
      token: 'dummy-jwt-token-' + Date.now(),
      refreshToken: 'dummy-refresh-token',
      expiresIn: 3600,
      roles: ['admin', 'user'],
      email: context.username + '@example.com',
      firstName: 'Demo',
      lastName: 'User',
    });

    this._credentialsService.setCredentials(credentials, context.remember);

    return of(credentials);
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    this._credentialsService.setCredentials();
    return of(true);
  }
}

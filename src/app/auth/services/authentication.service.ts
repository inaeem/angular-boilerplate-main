import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { authConfig } from '@app/auth/oauth.config';
import { CredentialsService } from '@app/auth/services/credentials.service';
import { Credentials } from '@core/entities';

/**
 * Authentication workflow backed by OAuth2 / OIDC (`angular-oauth2-oidc`),
 * using the Authorization Code Flow with PKCE.
 *
 * Two streams drive the route guards:
 *  - `isAuthenticated$` — is there a valid access token right now?
 *  - `isDoneLoading$`   — has the initial login sequence (discovery + tryLogin) finished?
 *
 * Guards must wait for `isDoneLoading$` before trusting `isAuthenticated$`,
 * otherwise they evaluate the token before the redirect callback is processed.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  private readonly _isDoneLoading$ = new BehaviorSubject<boolean>(false);
  readonly isDoneLoading$ = this._isDoneLoading$.asObservable();

  /** Emits true only once loading is finished AND a valid token exists. */
  readonly canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$,
  ]).pipe(map((flags) => flags.every(Boolean)));

  /**
   * OAuth events that mean the session is gone and cannot be recovered
   * (refresh failed / IdP session ended). When one fires, we force a re-login.
   */
  private static readonly SESSION_LOST_EVENTS = [
    'token_refresh_error',
    'silent_refresh_error',
    'silent_refresh_timeout',
    'session_terminated',
    'session_error',
  ];

  constructor(
    private readonly _oauth: OAuthService,
    private readonly _credentialsService: CredentialsService,
    private readonly _router: Router,
  ) {
    this._oauth.configure(authConfig);

    // Subscribed at construction (before runInitialLoginSequence) so the
    // token_received event fired during tryLogin can never be missed.
    this._oauth.events.subscribe((event) => {
      this._isAuthenticated$.next(this._oauth.hasValidAccessToken());
      this._syncCredentials();
      this._handleSessionExpiry(event);
    });

    // Keep the access token fresh automatically. With code flow + a refresh
    // token (offline_access scope) this silently calls the token endpoint
    // before the *access token* expires. If the refresh fails, a *_error event
    // handled above redirects the user to login.
    this._oauth.setupAutomaticSilentRefresh({}, 'access_token');
  }

  /**
   * Actively redirect to the login page the moment the session is lost — even
   * if the user is idle on a page (the route guard only re-checks on navigation).
   */
  private _handleSessionExpiry(event: OAuthEvent): void {
    const sessionLost = AuthenticationService.SESSION_LOST_EVENTS.includes(event.type);
    // token_expires fires just before expiry; only act if no refresh kept us valid.
    const expiredWithoutRefresh = event.type === 'token_expires' && !this._oauth.hasValidAccessToken();

    if ((sessionLost || expiredWithoutRefresh) && !this._oauth.hasValidAccessToken()) {
      this._redirectToLogin();
    }
  }

  private _redirectToLogin(): void {
    this._credentialsService.setCredentials(); // ensure local credentials are cleared
    if (!this._router.url.startsWith('/login')) {
      this._router.navigate(['/login'], { replaceUrl: true });
    }
  }

  /**
   * Runs once at startup (via APP_INITIALIZER). Loads the discovery document
   * and processes a redirect callback if we're returning from the IdP.
   * Resolves only after tokens (if any) are validated and stored.
   */
  runInitialLoginSequence(): Promise<void> {
    return this._oauth
      .loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        this._isAuthenticated$.next(this._oauth.hasValidAccessToken());
        this._syncCredentials();
      })
      .catch((err) => {
        // Don't block the app from bootstrapping if the IdP is unreachable.
        console.error('OIDC initial login sequence failed:', err);
      })
      .finally(() => {
        this._isDoneLoading$.next(true);
      });
  }

  /** Starts the login by redirecting the browser to the IdP. */
  login(targetUrl?: string): void {
    // targetUrl is stored as state and restored by the library after the callback.
    this._oauth.initLoginFlow(targetUrl ?? window.location.pathname);
  }

  /** Logs out locally and at the IdP. */
  logout(): void {
    this._oauth.logOut();
  }

  isAuthenticated(): boolean {
    return this._oauth.hasValidAccessToken();
  }

  get accessToken(): string {
    return this._oauth.getAccessToken();
  }

  get identityClaims(): Record<string, unknown> | null {
    return this._oauth.getIdentityClaims() as Record<string, unknown> | null;
  }

  /**
   * Mirrors the current OIDC session into CredentialsService so the rest of the
   * app (PermissionService, header, etc.) can read the user profile and roles
   * from a single place. Clears credentials when there is no valid token.
   */
  private _syncCredentials(): void {
    if (!this._oauth.hasValidAccessToken()) {
      if (this._credentialsService.credentials) {
        this._credentialsService.setCredentials(); // clear
      }
      return;
    }

    const claims = (this._oauth.getIdentityClaims() ?? {}) as Record<string, any>;
    const credentials = new Credentials({
      id: claims['sub'] ?? '',
      username: claims['preferred_username'] ?? claims['name'] ?? claims['email'] ?? '',
      firstName: claims['given_name'] ?? '',
      lastName: claims['family_name'] ?? '',
      email: claims['email'] ?? '',
      token: this._oauth.getAccessToken(),
      roles: this._extractRoles(claims),
    });

    // remember=false → store in sessionStorage, consistent with the OAuth tokens.
    this._credentialsService.setCredentials(credentials, false);
  }

  /**
   * Normalizes role claims from common IdP shapes into a lowercase string[]
   * that matches the ROLE enum. Adjust the claim names for your IdP if needed:
   *  - generic:  `roles` / `role`
   *  - Keycloak: `realm_access.roles`
   *  - groups:   `groups`
   */
  private _extractRoles(claims: Record<string, any>): string[] {
    const raw = claims['roles'] ?? claims['role'] ?? claims['realm_access']?.roles ?? claims['groups'] ?? [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.filter(Boolean).map((r) => String(r).toLowerCase());
  }

  /** One-shot stream that waits until loading is done, then emits the auth state. */
  get settledAuthState$(): Observable<boolean> {
    return this.isDoneLoading$.pipe(
      filter(Boolean),
      map(() => this._oauth.hasValidAccessToken()),
      distinctUntilChanged(),
    );
  }
}

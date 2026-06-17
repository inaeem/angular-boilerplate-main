import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { authConfig } from '@app/auth/oauth.config';

/**
 * Thin wrapper around `OAuthService` that exposes a deterministic auth state.
 *
 * Two streams drive the guards:
 *  - `isAuthenticated$`  — is there a valid access token right now?
 *  - `isDoneLoading$`    — has the initial login sequence (discovery + tryLogin) finished?
 *
 * Guards must wait for `isDoneLoading$` before trusting `isAuthenticated$`,
 * otherwise they evaluate the token before the redirect callback is processed.
 */
@Injectable({ providedIn: 'root' })
export class OAuthAuthService {
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  private readonly _isDoneLoading$ = new BehaviorSubject<boolean>(false);
  readonly isDoneLoading$ = this._isDoneLoading$.asObservable();

  /** Emits true only once loading is finished AND a valid token exists. */
  readonly canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$,
  ]).pipe(map((flags) => flags.every(Boolean)));

  constructor(private readonly _oauth: OAuthService) {
    this._oauth.configure(authConfig);

    // Subscribed at construction (before runInitialLoginSequence) so the
    // token_received event fired during tryLogin can never be missed.
    this._oauth.events.subscribe(() => {
      this._isAuthenticated$.next(this._oauth.hasValidAccessToken());
    });

    // Keep the access token fresh automatically (silent refresh / refresh token).
    this._oauth.setupAutomaticSilentRefresh();
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

  hasValidToken(): boolean {
    return this._oauth.hasValidAccessToken();
  }

  get accessToken(): string {
    return this._oauth.getAccessToken();
  }

  get identityClaims(): Record<string, unknown> | null {
    return this._oauth.getIdentityClaims() as Record<string, unknown> | null;
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

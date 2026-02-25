import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

import { Logger } from '@app/@core/services';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CredentialsService } from '@app/auth';

const log = new Logger('AuthenticationGuard');

/**
 * Guard that checks if a user is already authenticated and redirects them to the dashboard.
 * Uses OAuth2/OIDC token validation.
 */
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AlreadyLoggedCheckGuard {
  constructor(
    private readonly _credentialsService: CredentialsService,
    private readonly _oauthService: OAuthService,
    private readonly _router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    // Check if user has valid OAuth2 token
    const hasValidToken = this._oauthService.hasValidAccessToken();
    const isAuthenticated = this._credentialsService.isAuthenticated();

    if (hasValidToken && isAuthenticated) {
      log.debug('User already authenticated, redirecting to dashboard');
      this._router.navigateByUrl('/dashboard');
      return false;
    }

    return true;
  }
}

/**
 * Guard that checks if a user is authenticated before allowing access to protected routes.
 * Uses OAuth2/OIDC token validation and redirects to login if not authenticated.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard {
  constructor(
    private readonly _router: Router,
    private readonly _credentialsService: CredentialsService,
    private readonly _oauthService: OAuthService,
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Check if user has valid OAuth2 token
    const hasValidToken = this._oauthService.hasValidAccessToken();
    const isAuthenticated = this._credentialsService.isAuthenticated();

    if (hasValidToken && isAuthenticated) {
      return true;
    }

    // If token is expired but we have a refresh token, try to refresh
    if (this._oauthService.getRefreshToken() && !hasValidToken) {
      try {
        log.debug('Token expired, attempting silent refresh...');
        await this._oauthService.refreshToken();

        // Check again after refresh
        if (this._oauthService.hasValidAccessToken()) {
          log.debug('Token refreshed successfully');
          return true;
        }
      } catch (error) {
        log.debug('Token refresh failed:', error);
      }
    }

    // Not authenticated, redirect to login
    log.debug('Not authenticated, redirecting to login with redirect url...');
    this._router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }
}

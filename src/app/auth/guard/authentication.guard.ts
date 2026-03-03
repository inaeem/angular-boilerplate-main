import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { Logger } from '@app/@core/services';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CredentialsService } from '@app/auth';

const log = new Logger('AuthenticationGuard');

/**
 * Guard that checks if a user is already authenticated and redirects them to the dashboard.
 */
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AlreadyLoggedCheckGuard {
  constructor(
    private readonly _credentialsService: CredentialsService,
    private readonly _router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    const isAuthenticated = this._credentialsService.isAuthenticated();

    if (isAuthenticated) {
      log.debug('User already authenticated, redirecting to dashboard');
      this._router.navigateByUrl('/dashboard');
      return false;
    }

    return true;
  }
}

/**
 * Guard that checks if a user is authenticated before allowing access to protected routes.
 * Redirects to login if not authenticated.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard {
  constructor(
    private readonly _router: Router,
    private readonly _credentialsService: CredentialsService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this._credentialsService.isAuthenticated()) {
      return true;
    }

    // Not authenticated, redirect to login
    log.debug('Not authenticated, redirecting to login with redirect url...');
    this._router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { Logger } from '@app/@core/services';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthenticationService } from '@app/auth/services/authentication.service';

const log = new Logger('AuthenticationGuard');

/**
 * Guard for the login route: if the user is already authenticated, send them
 * to the home page (dashboard) instead of showing the login screen.
 */
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AlreadyLoggedCheckGuard {
  constructor(
    private readonly _auth: AuthenticationService,
    private readonly _router: Router,
  ) {}

  canActivate(): Observable<boolean> {
    // Wait until the initial OIDC sequence has settled before deciding.
    return this._auth.isDoneLoading$.pipe(
      filter(Boolean),
      take(1),
      map(() => {
        if (this._auth.isAuthenticated()) {
          log.debug('Already authenticated, redirecting to dashboard');
          this._router.navigateByUrl('/dashboard');
          return false;
        }
        return true;
      }),
    );
  }
}

/**
 * Guard for protected routes: allow access only when authenticated, otherwise
 * redirect to the login page (preserving the attempted URL).
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard {
  constructor(
    private readonly _router: Router,
    private readonly _auth: AuthenticationService,
  ) {}

  canActivate(): Observable<boolean> {
    return this._auth.isDoneLoading$.pipe(
      filter(Boolean),
      take(1),
      map(() => {
        if (this._auth.isAuthenticated()) {
          return true;
        }
        log.debug('Not authenticated, redirecting to login');
        this._router.navigate(['/login'], { replaceUrl: true });
        return false;
      }),
    );
  }

  // Allow this guard to be used as `canActivateChild` so every child route
  // (including deeply nested / lazy ones) is re-checked on navigation.
  canActivateChild(): Observable<boolean> {
    return this.canActivate();
  }
}

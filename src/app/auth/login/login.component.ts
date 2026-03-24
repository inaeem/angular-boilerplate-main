import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthenticationService } from '@app/auth';

import { environment } from '@env/environment';

type PortalType = 'admin' | 'provider' | 'developer';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  version: string | null = environment.version;
  isLoading = false;
  selectedPortal: PortalType | null = null;

  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthenticationService,
  ) {}

  /**
   * Login with selected portal type
   */
  login(portalType: PortalType): void {
    this.isLoading = true;
    this.selectedPortal = portalType;

    // Simulate login with the portal type as username
    this._authService
      .login({
        username: portalType,
        password: 'portal',
        remember: true,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (credentials) => {
          if (credentials) {
            console.log(`Logged in as ${portalType}`, credentials);
            // Navigate to dashboard
            this._router.navigate(['/dashboard'], { replaceUrl: true }).then(() => {
              console.log('Navigated to dashboard');
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.selectedPortal = null;
          console.error('Login error:', error);
        },
      });
  }
}

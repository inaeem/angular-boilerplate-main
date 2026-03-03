import { Component } from '@angular/core';

import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthenticationService } from '@app/auth';
import { ActivatedRoute, Router } from '@angular/router';

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
  username = '';
  password = '';

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _authService: AuthenticationService,
  ) {}

  /**
   * Performs dummy login with any username/password.
   */
  login() {
    this.isLoading = true;

    // Simple dummy login - accepts any username/password
    this._authService
      .login({
        username: this.username || 'demo',
        password: this.password || 'password',
        remember: true,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (credentials) => {
          this.isLoading = false;
          if (credentials) {
            console.log('Login successful', credentials);
            // Navigate to the redirect URL or dashboard
            const redirect = this._route.snapshot.queryParams['redirect'] || '/dashboard';
            this._router.navigate([redirect], { replaceUrl: true }).then(() => {
              console.log('Navigated to', redirect);
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
        },
      });
  }
}

import { Component, OnInit } from '@angular/core';

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
export class LoginComponent implements OnInit {
  version: string | null = environment.version;
  isLoading = false;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    // Handle OAuth2 callback when returning from authorization server
    // Check if we have a code or token in the URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || window.location.hash.includes('access_token');

    if (hasOAuthParams) {
      this.isLoading = true;
      this._authService
        .handleLoginCallback()
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (credentials) => {
            this.isLoading = false;
            if (credentials) {
              console.log('OAuth2 login successful');
              // Navigate to the redirect URL or dashboard
              const redirect = this._route.snapshot.queryParams['redirect'] || '/dashboard';
              this._router.navigate([redirect], { replaceUrl: true }).then(() => {
                console.log('Navigated to', redirect);
              });
            } else {
              console.error('Failed to obtain credentials from OAuth2 callback');
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('OAuth2 login error:', error);
          },
        });
    }
  }

  /**
   * Initiates the OAuth2/OIDC login flow.
   * This will redirect the user to the authorization server for authentication.
   */
  login() {
    this.isLoading = true;

    // Initiate OAuth2/OIDC login flow
    // The user will be redirected to the authorization server
    // After successful authentication, they will be redirected back to this component
    this._authService
      .login({
        remember: true, // You can make this configurable with a checkbox in the UI
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (initiated) => {
          if (initiated) {
            console.log('OAuth2 login flow initiated');
            // User will be redirected to authorization server
            // No need to navigate here as the OAuth service handles the redirect
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to initiate OAuth2 login:', error);
        },
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthAuthService } from '@app/auth/services/oauth-auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  standalone: false,
})
export class LogoutComponent implements OnInit {
  constructor(
    private readonly _auth: OAuthAuthService,
    private readonly _router: Router,
  ) {}

  ngOnInit() {
    if (this._auth.hasValidToken()) {
      // Clears local tokens and redirects to the IdP end-session endpoint
      // (which then returns to postLogoutRedirectUri).
      this._auth.logout();
    } else {
      this._router.navigate(['/login']);
    }
  }
}

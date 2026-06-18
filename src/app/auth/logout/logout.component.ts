import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/auth/services/authentication.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  standalone: false,
})
export class LogoutComponent implements OnInit {
  constructor(
    private readonly _auth: AuthenticationService,
    private readonly _router: Router,
  ) {}

  ngOnInit() {
    if (this._auth.isAuthenticated()) {
      // Clears local tokens and redirects to the IdP end-session endpoint
      // (which then returns to postLogoutRedirectUri).
      this._auth.logout();
    } else {
      this._router.navigate(['/login']);
    }
  }
}

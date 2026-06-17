import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { OAuthAuthService } from '@app/auth/services/oauth-auth.service';

import { environment } from '@env/environment';

type PortalType = 'admin' | 'provider' | 'developer';

interface PortalConfig {
  type: PortalType;
  role: string;
}

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
  portalName = 'Multi-Portal System';

  // Portal configurations with role names
  portals: Record<PortalType, PortalConfig> = {
    admin: { type: 'admin', role: 'Admin' },
    provider: { type: 'provider', role: 'Provider' },
    developer: { type: 'developer', role: 'Developer' },
  };

  constructor(private readonly _auth: OAuthAuthService) {}

  /**
   * Get translation parameters for portal name
   */
  getWelcomeParams(): { portalName: string } {
    return { portalName: this.portalName };
  }

  /**
   * Get translation parameters for a specific portal button
   */
  getButtonParams(portalType: PortalType): { role: string } {
    return { role: this.portals[portalType].role };
  }

  /**
   * Start the OAuth/OIDC login by redirecting to the identity provider.
   * The browser navigates away to the IdP; after a successful login it is
   * redirected back and `OAuthAuthService.runInitialLoginSequence()` (run via
   * APP_INITIALIZER) completes the flow and stores the tokens.
   */
  login(portalType: PortalType): void {
    this.isLoading = true;
    this.selectedPortal = portalType;

    // Send the user to the IdP. Land back on the dashboard once authenticated.
    this._auth.login('/dashboard');
  }
}

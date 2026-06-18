import { Injectable } from '@angular/core';
import { CredentialsService, ROLE } from '@app/auth';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private readonly _credentialsService: CredentialsService) {}

  get userRole(): ROLE {
    // Always read fresh — credentials are populated after OIDC login, which
    // happens after this singleton is first constructed.
    return this._credentialsService.credentials?.roles?.[0] as ROLE;
  }

  /**
   * Checks whether the logged-in user has any of the required roles.
   * @param requiredRoles Roles allowed to access the resource.
   * @returns True if the user's roles include at least one required role.
   */
  hasRole(requiredRoles: ROLE[]): boolean {
    const credentials = this._credentialsService.credentials;
    if (!credentials || !credentials.roles) {
      return false;
    }
    return requiredRoles.some((role) => credentials.roles.includes(role));
  }
}

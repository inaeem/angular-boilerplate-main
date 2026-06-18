import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { PermissionService, ROLE } from '@auth';

/**
 * Allows access to a route only when the user has one of the roles listed in
 * the route's `data.roles`. Routes without `data.roles` are always allowed.
 * On failure the user is redirected to the unauthorized page.
 */
export const PermissionGuard: CanActivateFn & CanActivateChildFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as ROLE[] | undefined;
  if (requiredRoles?.length && !permissionService.hasRole(requiredRoles)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

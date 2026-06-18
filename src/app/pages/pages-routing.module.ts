import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Shell } from '@app/shell/services/shell.service';
import { ROLE } from '@app/auth';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { ContactComponent } from '@pages/contact/contact.component';
import { UnauthorizedComponent } from '@pages/unauthorized/unauthorized.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'users',
      loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
      // Role-gated: only these roles (from the JWT) may enter.
      data: { roles: [ROLE.ADMIN] },
    },
    {
      path: 'products',
      loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule),
      data: { roles: [ROLE.ADMIN] },
    },
    {
      path: 'contact',
      component: ContactComponent,
    },
    {
      // Landing page for PermissionGuard denials. No permission data so any
      // authenticated user can reach it.
      path: 'unauthorized',
      component: UnauthorizedComponent,
    },

    // Fallback when no prior route is matched
    { path: '**', redirectTo: '', pathMatch: 'full' },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}

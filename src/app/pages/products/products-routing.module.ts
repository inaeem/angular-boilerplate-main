import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from '@pages/products/list/list.component';
import { AddComponent } from '@pages/products/add/add.component';
import { ViewComponent } from '@pages/products/view/view.component';
import { PrintComponent } from '@pages/products/print/print.component';
import { ProvidersListComponent } from '@pages/products/providers-list/providers-list.component';
import { CredentialsComponent } from '@pages/products/credentials/credentials.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'providers',
    component: ProvidersListComponent,
  },
  {
    path: 'add',
    component: AddComponent,
  },
  {
    path: 'edit/:id',
    component: AddComponent,
  },
  {
    path: 'view/:id',
    component: ViewComponent,
  },
  {
    path: 'credentials/:id',
    component: CredentialsComponent,
  },
  {
    path: 'print/:id',
    component: PrintComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}

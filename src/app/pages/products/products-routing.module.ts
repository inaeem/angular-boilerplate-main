import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from '@pages/products/list/list.component';
import { AddComponent } from '@pages/products/add/add.component';
import { ViewComponent } from '@pages/products/view/view.component';
import { PrintComponent } from '@pages/products/print/print.component';

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
    path: 'print/:id',
    component: PrintComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}

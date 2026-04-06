import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ProductsRoutingModule } from './products-routing.module';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { ViewComponent } from './view/view.component';
import { PrintComponent } from './print/print.component';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { ProvidersListReactiveComponent } from './providers-list-reactive/providers-list-reactive.component';
import { AddReactiveComponent } from './add-reactive/add-reactive.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { DeactivateProviderComponent } from '@shared/components';

@NgModule({
  declarations: [ListComponent, AddComponent, AddReactiveComponent, ViewComponent, PrintComponent, ProvidersListComponent, ProvidersListReactiveComponent, CredentialsComponent, DeactivateProviderComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ProductsRoutingModule],
})
export class ProductsModule {}

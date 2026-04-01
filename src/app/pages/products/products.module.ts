import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ProductsRoutingModule } from './products-routing.module';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { ViewComponent } from './view/view.component';
import { PrintComponent } from './print/print.component';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { DeactivateProviderComponent } from '@shared/components';

@NgModule({
  declarations: [ListComponent, AddComponent, ViewComponent, PrintComponent, ProvidersListComponent, CredentialsComponent, DeactivateProviderComponent],
  imports: [CommonModule, FormsModule, TranslateModule, ProductsRoutingModule],
})
export class ProductsModule {}

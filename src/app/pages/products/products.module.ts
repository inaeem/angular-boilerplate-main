import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ProductsRoutingModule } from './products-routing.module';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { ViewComponent } from './view/view.component';
import { PrintComponent } from './print/print.component';

@NgModule({
  declarations: [ListComponent, AddComponent, ViewComponent, PrintComponent],
  imports: [CommonModule, FormsModule, TranslateModule, ProductsRoutingModule],
})
export class ProductsModule {}

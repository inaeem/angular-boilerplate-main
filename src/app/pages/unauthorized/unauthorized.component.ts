import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink, TranslateModule],
  templateUrl: './unauthorized.component.html',
})
export class UnauthorizedComponent {}

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { NavMode, ShellService } from '@app/shell/services/shell.service';
import { webSidebarMenuItems } from '@core/constants';
import { CredentialsService } from '@auth';
import { NavMenuItem } from '@core/interfaces';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  version: string = environment.version;
  menuItems: NavMenuItem[] = [];
  extendedItem = -1;

  constructor(
    private readonly _router: Router,
    private readonly _credentialsService: CredentialsService,
    public shellService: ShellService,
  ) {
    this.menuItems = webSidebarMenuItems;
  }

  ngOnInit(): void {
    this.shellService.activeNavTab(this.menuItems, this.extendedItem);

    this._router.events
      .pipe(untilDestroyed(this))
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.shellService.activeNavTab(this.menuItems, this.extendedItem);
      });
  }

  activateMenuItem(index: number): void {
    const item = this.menuItems[index];
    if (item.disabled) return;

    if (index !== this.extendedItem) {
      this.extendedItem = index;
    } else {
      this.extendedItem = -1; // Toggle the same item
    }

    this.shellService.activateNavItem(index, this.menuItems);
  }

  activateSubItem(index: number, subItem: NavMenuItem): void {
    this.shellService.activateNavSubItem(index, subItem, this.menuItems);
  }
}

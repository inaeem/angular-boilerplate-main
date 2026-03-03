import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Toast, ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
  standalone: false,
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private readonly _toastService: ToastService) {}

  ngOnInit(): void {
    this._toastService.toast$.pipe(untilDestroyed(this)).subscribe((toast) => {
      this.toasts.push(toast);
      if (toast.duration) {
        setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
      }
    });
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  getToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
        return 'bg-info text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'ti-check-circle';
      case 'error':
        return 'ti-alert-circle';
      case 'warning':
        return 'ti-alert-triangle';
      case 'info':
        return 'ti-info-circle';
      default:
        return 'ti-bell';
    }
  }
}

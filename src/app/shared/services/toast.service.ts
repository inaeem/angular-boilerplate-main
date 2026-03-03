import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  success(title: string, message: string, duration = 3000): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration = 5000): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration = 4000): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration = 3000): void {
    this.show('info', title, message, duration);
  }

  private show(type: Toast['type'], title: string, message: string, duration: number): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
    };
    this.toastSubject.next(toast);
  }
}

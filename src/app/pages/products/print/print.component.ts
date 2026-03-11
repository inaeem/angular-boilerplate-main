import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProvidersService } from '../services/providers.service';
import { Provider } from '../entities/provider.entity';
import { ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss'],
  standalone: false,
})
export class PrintComponent implements OnInit {
  provider: Provider | null = null;
  isLoading = true;
  providerId: number | null = null;
  printDate = new Date();

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _providersService: ProvidersService,
    private readonly _toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.providerId = parseInt(id, 10);
      this.loadProvider(this.providerId);
    } else {
      this._router.navigate(['/products']);
    }
  }

  loadProvider(id: number): void {
    this.isLoading = true;
    this._providersService
      .getProviderById(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (provider) => {
          if (provider) {
            this.provider = provider;
            this.isLoading = false;
            // Auto-print after a short delay to ensure content is rendered
            setTimeout(() => {
              // Uncomment to enable auto-print: window.print();
            }, 500);
          } else {
            this.isLoading = false;
            this._toastService.error('Provider Not Found', 'The requested provider could not be found.');
            this._router.navigate(['/products']);
          }
        },
        error: (error) => {
          console.error('Error loading provider:', error);
          this.isLoading = false;
          this._toastService.error('Load Failed', 'Failed to load provider details.');
          this._router.navigate(['/products']);
        },
      });
  }

  print(): void {
    window.print();
  }

  goBack(): void {
    this._router.navigate(['/products/view', this.providerId]);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'bg-success',
      'pending': 'bg-warning',
      'approved': 'bg-info',
      'rejected': 'bg-danger',
      'suspended': 'bg-secondary',
    };
    return statusMap[status] || 'bg-secondary';
  }

  getGrantTypeLabel(grantType: string): string {
    const grantTypeMap: { [key: string]: string } = {
      'authorization_code': 'Authorization Code',
      'client_credentials': 'Client Credentials',
      'implicit': 'Implicit',
    };
    return grantTypeMap[grantType] || grantType;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Make Object available in template
  Object = Object;
}

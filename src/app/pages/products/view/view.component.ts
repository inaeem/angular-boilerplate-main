import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProvidersService } from '../services/providers.service';
import { Provider } from '../entities/provider.entity';
import { ToastService } from '@shared/services/toast.service';


@UntilDestroy()
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: false,
})
export class ViewComponent implements OnInit {
  provider: Provider | null = null;
  isLoading = true;
  providerId: number | null = null;

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

  printView(): void {
    if (this.providerId) {
      this._router.navigate(['/products/print', this.providerId]);
    }
  }

  goBack(): void {
    this._router.navigate(['/products']);
  }

  editProvider(): void {
    if (this.providerId) {
      this._router.navigate(['/products/edit', this.providerId]);
    }
  }

  viewCredentials(): void {
    if (this.providerId) {
      this._router.navigate(['/products/credentials', this.providerId]);
    }
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

  getCurrentDate(): Date {
    return new Date();
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

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  }

  getAvatarColor(id: number): string {
    const colors = [
      '#206bc4', // azure
      '#4299e1', // blue
      '#0ca678', // green
      '#f59f00', // orange
      '#d63939', // red
      '#ae3ec9', // purple
    ];
    return colors[id % colors.length];
  }

  getAvatarGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    ];
    return gradients[id % gradients.length];
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update active state for navigation items
      this.updateActiveNavItem(sectionId);
    }
  }

  updateActiveNavItem(sectionId: string): void {
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to the clicked nav item
    const activeItem = document.querySelector(`.sidebar-nav-item[href="#${sectionId}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  // Make Object available in template for Object.keys()
  Object = Object;
}

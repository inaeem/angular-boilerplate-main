import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProvidersService } from '../services/providers.service';
import { PlansService } from '../services/plans.service';
import { Provider } from '../entities/provider.entity';
import { Plan } from '../entities';
import { ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-providers-list',
  standalone: false,
  templateUrl: './providers-list.component.html',
  styleUrl: './providers-list.component.scss',
})
export class ProvidersListComponent implements OnInit {
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  searchQuery = '';
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Filter state
  selectedJobTypes: string[] = [];
  selectedStatus: string[] = [];
  selectedGrantTypes: string[] = [];
  certifiedOnly = false;
  location = 'all';

  // Plans data
  plans: Plan[] = [];

  // Skeleton loader placeholders
  skeletonArray = Array(6).fill(0);

  constructor(
    private readonly _providersService: ProvidersService,
    private readonly _plansService: PlansService,
    private readonly _toastService: ToastService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadProviders();
  }

  loadPlans(): void {
    this._plansService
      .getPlans()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (plans) => {
          this.plans = plans;
        },
        error: (error) => {
          console.error('Error loading plans:', error);
        },
      });
  }

  loadProviders(): void {
    this.isLoading = true;
    this.hasError = false;
    this._providersService
      .getProviders()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (providers) => {
          this.providers = providers;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = 'Failed to load providers. Please try again later.';
        },
      });
  }

  retryLoading(): void {
    this.loadProviders();
  }

  applyFilters(): void {
    let filtered = [...this.providers];

    // Filter by status
    if (this.selectedStatus.length > 0) {
      filtered = filtered.filter((p) => this.selectedStatus.includes(p.status));
    }

    // Filter by grant type
    if (this.selectedGrantTypes.length > 0) {
      filtered = filtered.filter((p) => this.selectedGrantTypes.includes(p.allowedGrant));
    }

    // Filter by certified
    if (this.certifiedOnly) {
      filtered = filtered.filter((p) => p.isCertified);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (provider) =>
          provider.applicationName.toLowerCase().includes(query) ||
          provider.applicationDescription.toLowerCase().includes(query) ||
          provider.contactPersonName.toLowerCase().includes(query) ||
          provider.officialEmail.toLowerCase().includes(query),
      );
    }

    this.filteredProviders = filtered;
  }

  searchProviders(): void {
    this.applyFilters();
  }

  toggleStatus(status: string): void {
    const index = this.selectedStatus.indexOf(status);
    if (index > -1) {
      this.selectedStatus.splice(index, 1);
    } else {
      this.selectedStatus.push(status);
    }
    this.applyFilters();
  }

  toggleGrantType(grantType: string): void {
    const index = this.selectedGrantTypes.indexOf(grantType);
    if (index > -1) {
      this.selectedGrantTypes.splice(index, 1);
    } else {
      this.selectedGrantTypes.push(grantType);
    }
    this.applyFilters();
  }

  toggleCertified(): void {
    this.certifiedOnly = !this.certifiedOnly;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = [];
    this.selectedGrantTypes = [];
    this.certifiedOnly = false;
    this.location = 'all';
    this.applyFilters();
  }

  filterByStatus(status: string): void {
    if (status === 'all') {
      this.selectedStatus = [];
    } else {
      this.selectedStatus = [status];
    }
    this.applyFilters();
  }

  getStatusCount(status: string): number {
    return this.providers.filter((p) => p.status === status).length;
  }

  getGrantTypeCount(grantType: string): number {
    return this.providers.filter((p) => p.allowedGrant === grantType).length;
  }

  getCertifiedCount(): number {
    return this.providers.filter((p) => p.isCertified).length;
  }

  viewProvider(provider: Provider): void {
    this._router.navigate(['/products/view', provider.id]);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-info';
      case 'rejected':
        return 'bg-danger';
      case 'suspended':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getGrantTypeLabel(grantType: string): string {
    switch (grantType) {
      case 'authorization_code':
        return 'Authorization Code';
      case 'client_credentials':
        return 'Client Credentials';
      case 'implicit':
        return 'Implicit';
      default:
        return grantType;
    }
  }

  getPlanNames(planIds: number[]): string[] {
    if (!planIds || planIds.length === 0) return [];
    return planIds
      .map((id) => {
        const plan = this.plans.find((p) => p.id === id);
        return plan ? plan.name : null;
      })
      .filter((name): name is string => name !== null);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const parent = imgElement.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="provider-logo-placeholder error">
          <div class="placeholder-content">
            <i class="ti ti-photo-off" style="font-size: 3rem; opacity: 0.3;"></i>
            <div class="text-muted small mt-2">Image not available</div>
          </div>
        </div>
      `;
    }
  }
}

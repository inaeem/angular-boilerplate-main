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
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent implements OnInit {
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  searchQuery = '';
  isLoading = false;
  isSearching = false;
  hasError = false;
  errorMessage = '';

  // Tab navigation
  activeTab: 'all' | 'active' | 'pending' = 'all';

  // Delete confirmation modal
  providerToDelete: Provider | null = null;
  showDeleteModal = false;

  // Skeleton loader placeholders
  skeletonArray = Array(8).fill(0);

  // Plans data
  plans: Plan[] = [];

  // Deactivation
  providerToDeactivate: Provider | null = null;
  deactivateTrigger = 0;

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

  switchTab(tab: 'all' | 'active' | 'pending'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.providers];

    // Filter by tab
    switch (this.activeTab) {
      case 'active':
        filtered = filtered.filter((p) => p.status === 'active');
        break;
      case 'pending':
        filtered = filtered.filter((p) => p.status === 'pending');
        break;
      case 'all':
      default:
        // Show all providers
        break;
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
    // Use local filtering for instant search
    this.applyFilters();
  }

  viewProvider(provider: Provider): void {
    this._router.navigate(['/products/view', provider.id]);
  }

  editProvider(provider: Provider): void {
    this._router.navigate(['/products/edit', provider.id]);
  }

  deleteProvider(provider: Provider): void {
    this.providerToDelete = provider;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.providerToDelete) return;

    const providerName = this.providerToDelete.applicationName;
    this._providersService
      .deleteProvider(this.providerToDelete.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (success) => {
          if (success) {
            this.providers = this.providers.filter((p) => p.id !== this.providerToDelete!.id);
            this.applyFilters();
            this._toastService.success('Provider Deleted', `"${providerName}" has been successfully deleted.`);
            this.closeDeleteModal();
          }
        },
        error: (error) => {
          console.error('Error deleting provider:', error);
          this._toastService.error('Delete Failed', 'Failed to delete provider. Please try again.');
          this.closeDeleteModal();
        },
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.providerToDelete = null;
  }

  getTabCount(tab: 'all' | 'active' | 'pending'): number {
    switch (tab) {
      case 'all':
        return this.providers.length;
      case 'active':
        return this.providers.filter((p) => p.status === 'active').length;
      case 'pending':
        return this.providers.filter((p) => p.status === 'pending').length;
      default:
        return 0;
    }
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

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const parent = imgElement.parentElement;
    if (parent) {
      // Replace broken image with placeholder
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

  getPlanNames(planIds: number[]): string[] {
    if (!planIds || planIds.length === 0) return [];
    return planIds
      .map(id => {
        const plan = this.plans.find(p => p.id === id);
        return plan ? plan.name : null;
      })
      .filter((name): name is string => name !== null);
  }

  /**
   * View provider credentials
   */
  viewCredentials(provider: Provider): void {
    // TODO: Implement credentials modal or navigate to credentials page
    this._toastService.info('View Credentials', `Viewing credentials for ${provider.applicationName}`);
    console.log('View credentials for provider:', provider);
    // You can implement a modal dialog here or navigate to a credentials page
    // Example: this._router.navigate(['/products/credentials', provider.id]);
  }

  /**
   * Deactivate a provider
   */
  deactivateProvider(provider: Provider): void {
    this.providerToDeactivate = provider;
    this.deactivateTrigger++;
  }

  onProviderDeactivated(): void {
    this.loadProviders();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProvidersService } from '../services/providers.service';
import { PlansService } from '../services/plans.service';
import { Provider } from '../entities/provider.entity';
import { Plan } from '../entities';
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

  // Deactivation modal
  showDeactivateModal = false;
  isLoadingDeactivationData = false;
  isSubmittingDeactivation = false;
  deactivateEntireProvider = true;
  selectedLOBs: number[] = [];
  deactivationReason = '';
  showDeactivationError = false;
  deactivationErrorMessage = '';

  // LOB/Plans data
  plans: Plan[] = [];
  providerPlans: Plan[] = [];
  filteredPlans: Plan[] = [];
  searchLOB = '';

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _providersService: ProvidersService,
    private readonly _plansService: PlansService,
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

  deactivateProvider(): void {
    if (this.provider && (this.provider.status === 'suspended' || this.provider.status === 'rejected')) {
      this._toastService.warning('Deactivate Provider', 'This provider is already inactive');
      return;
    }

    // Load plans and open modal
    this.loadPlansAndOpenModal();
  }

  loadPlansAndOpenModal(): void {
    this.isLoadingDeactivationData = true;

    this._plansService
      .getPlans()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (plans) => {
          this.plans = plans || [];
          if (this.provider) {
            this.providerPlans = this.plans.filter((plan) =>
              this.provider!.selectedPlans.includes(plan.id)
            );
            this.filteredPlans = [...this.providerPlans];
          }
          this.isLoadingDeactivationData = false;
          this.showDeactivateModal = true;
        },
        error: (error) => {
          console.error('Error loading plans:', error);
          this._toastService.error('Error', 'Failed to load plans');
          this.isLoadingDeactivationData = false;
        },
      });
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal = false;
    this.isLoadingDeactivationData = false;
    this.isSubmittingDeactivation = false;
    this.deactivateEntireProvider = true;
    this.selectedLOBs = [];
    this.deactivationReason = '';
    this.searchLOB = '';
    this.showDeactivationError = false;
    this.deactivationErrorMessage = '';
  }

  setDeactivationType(isEntire: boolean): void {
    this.deactivateEntireProvider = isEntire;
    if (this.deactivateEntireProvider) {
      this.selectedLOBs = [];
    }
    this.showDeactivationError = false;
  }

  toggleLOB(planId: number): void {
    const index = this.selectedLOBs.indexOf(planId);
    if (index > -1) {
      this.selectedLOBs.splice(index, 1);
    } else {
      this.selectedLOBs.push(planId);
    }
    this.showDeactivationError = false;
  }

  isLOBSelected(planId: number): boolean {
    return this.selectedLOBs.includes(planId);
  }

  toggleAllLOBs(): void {
    if (this.areAllLOBsSelected()) {
      this.selectedLOBs = [];
    } else {
      this.selectedLOBs = this.providerPlans.map((plan) => plan.id);
    }
    this.showDeactivationError = false;
  }

  areAllLOBsSelected(): boolean {
    return (
      this.providerPlans.length > 0 &&
      this.selectedLOBs.length === this.providerPlans.length
    );
  }

  filterLOBs(): void {
    const query = this.searchLOB.toLowerCase().trim();
    if (!query) {
      this.filteredPlans = [...this.providerPlans];
    } else {
      this.filteredPlans = this.providerPlans.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          (plan.description && plan.description.toLowerCase().includes(query))
      );
    }
  }

  validateDeactivationForm(): boolean {
    if (!this.deactivationReason.trim()) {
      this.deactivationErrorMessage = 'Please provide a reason for deactivation';
      this.showDeactivationError = true;
      return false;
    }

    if (!this.deactivateEntireProvider && this.selectedLOBs.length === 0) {
      this.deactivationErrorMessage = 'Please select at least one LOB to deactivate';
      this.showDeactivationError = true;
      return false;
    }

    this.showDeactivationError = false;
    return true;
  }

  submitDeactivation(): void {
    if (!this.validateDeactivationForm() || !this.provider) {
      return;
    }

    this.isSubmittingDeactivation = true;

    // Update provider status
    if (this.deactivateEntireProvider) {
      this._providersService
        .updateProvider(this.provider.id, {
          ...this.provider,
          status: 'suspended',
          comments: `${this.provider.comments}\n\nDeactivated on ${new Date().toLocaleDateString()}: ${this.deactivationReason}`,
        })
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            this._toastService.success(
              'Provider Deactivated',
              `${this.provider!.applicationName} has been successfully deactivated`
            );
            this.closeDeactivateModal();
            this.loadProvider(this.provider!.id);
          },
          error: (error) => {
            console.error('Error deactivating provider:', error);
            this._toastService.error(
              'Error',
              'Failed to deactivate provider. Please try again.'
            );
            this.isSubmittingDeactivation = false;
          },
        });
    } else {
      // Partial deactivation - add comment about deactivated LOBs
      const lobNames = this.providerPlans
        .filter((plan) => this.selectedLOBs.includes(plan.id))
        .map((plan) => plan.name)
        .join(', ');

      this._providersService
        .updateProvider(this.provider.id, {
          ...this.provider,
          comments: `${this.provider.comments}\n\nLOBs deactivated on ${new Date().toLocaleDateString()} (${lobNames}): ${this.deactivationReason}`,
        })
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            this._toastService.success(
              'LOBs Deactivated',
              `Selected LOBs have been successfully deactivated`
            );
            this.closeDeactivateModal();
            this.loadProvider(this.provider!.id);
          },
          error: (error) => {
            console.error('Error deactivating LOBs:', error);
            this._toastService.error(
              'Error',
              'Failed to deactivate LOBs. Please try again.'
            );
            this.isSubmittingDeactivation = false;
          },
        });
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

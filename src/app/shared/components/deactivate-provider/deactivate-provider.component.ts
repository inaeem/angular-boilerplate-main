import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PlansService } from '../../../pages/products/services/plans.service';
import { ProvidersService } from '../../../pages/products/services/providers.service';
import { Provider } from '../../../pages/products/entities/provider.entity';
import { Plan } from '../../../pages/products/entities';
import { ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-deactivate-provider',
  templateUrl: './deactivate-provider.component.html',
  styleUrls: ['./deactivate-provider.component.scss'],
  standalone: false,
})
export class DeactivateProviderComponent implements OnChanges {
  @Input() provider: Provider | null = null;
  @Input() trigger = 0; // Increment to trigger modal open
  @Output() deactivated = new EventEmitter<void>();

  showModal = false;
  isLoadingData = false;
  isSubmitting = false;
  deactivateEntireProvider = true;
  selectedLOBs: number[] = [];
  deactivationReason = '';
  showError = false;
  errorMessage = '';

  plans: Plan[] = [];
  providerPlans: Plan[] = [];
  filteredPlans: Plan[] = [];
  searchLOB = '';

  constructor(
    private readonly _plansService: PlansService,
    private readonly _providersService: ProvidersService,
    private readonly _toastService: ToastService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trigger'] && !changes['trigger'].firstChange && this.provider) {
      this.openDeactivateModal();
    }
  }

  openDeactivateModal(): void {
    if (!this.provider) return;

    if (this.provider.status === 'suspended' || this.provider.status === 'rejected') {
      this._toastService.warning('Deactivate Provider', 'This provider is already inactive');
      return;
    }

    this.loadPlansAndOpenModal();
  }

  private loadPlansAndOpenModal(): void {
    this.isLoadingData = true;

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
          this.isLoadingData = false;
          this.showModal = true;
        },
        error: (error) => {
          console.error('Error loading plans:', error);
          this._toastService.error('Error', 'Failed to load plans');
          this.isLoadingData = false;
        },
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.isLoadingData = false;
    this.isSubmitting = false;
    this.deactivateEntireProvider = true;
    this.selectedLOBs = [];
    this.deactivationReason = '';
    this.searchLOB = '';
    this.showError = false;
    this.errorMessage = '';
  }

  setDeactivationType(isEntire: boolean): void {
    this.deactivateEntireProvider = isEntire;
    if (this.deactivateEntireProvider) {
      this.selectedLOBs = [];
    }
    this.showError = false;
  }

  toggleLOB(planId: number): void {
    const index = this.selectedLOBs.indexOf(planId);
    if (index > -1) {
      this.selectedLOBs.splice(index, 1);
    } else {
      this.selectedLOBs.push(planId);
    }
    this.showError = false;
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
    this.showError = false;
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

  private validateForm(): boolean {
    if (!this.deactivationReason.trim()) {
      this.errorMessage = 'Please provide a reason for deactivation';
      this.showError = true;
      return false;
    }

    if (!this.deactivateEntireProvider && this.selectedLOBs.length === 0) {
      this.errorMessage = 'Please select at least one LOB to deactivate';
      this.showError = true;
      return false;
    }

    this.showError = false;
    return true;
  }

  submitDeactivation(): void {
    if (!this.validateForm() || !this.provider) {
      return;
    }

    this.isSubmitting = true;

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
            this.closeModal();
            this.deactivated.emit();
          },
          error: (error) => {
            console.error('Error deactivating provider:', error);
            this._toastService.error(
              'Error',
              'Failed to deactivate provider. Please try again.'
            );
            this.isSubmitting = false;
          },
        });
    } else {
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
            this.closeModal();
            this.deactivated.emit();
          },
          error: (error) => {
            console.error('Error deactivating LOBs:', error);
            this._toastService.error(
              'Error',
              'Failed to deactivate LOBs. Please try again.'
            );
            this.isSubmitting = false;
          },
        });
    }
  }
}

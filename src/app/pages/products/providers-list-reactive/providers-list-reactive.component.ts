import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProvidersService } from '../services/providers.service';
import { PlansService } from '../services/plans.service';
import { Provider } from '../entities/provider.entity';
import { Plan } from '../entities';
import { ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-providers-list-reactive',
  standalone: false,
  templateUrl: './providers-list-reactive.component.html',
  styleUrl: './providers-list-reactive.component.scss',
})
export class ProvidersListReactiveComponent implements OnInit {
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Plans data
  plans: Plan[] = [];

  // Skeleton loader placeholders
  skeletonArray = Array(6).fill(0);

  // Filter form using reactive controls
  filterForm!: FormGroup;

  // Inline edit form for provider details
  editForm!: FormGroup;
  editingProviderId: number | null = null;

  // Available options for filters
  statusOptions = ['active', 'pending', 'approved', 'rejected', 'suspended'];
  grantTypeOptions = ['authorization_code', 'client_credentials', 'implicit'];

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _providersService: ProvidersService,
    private readonly _plansService: PlansService,
    private readonly _toastService: ToastService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.initEditForm();
    this.loadPlans();
    this.loadProviders();
  }

  // ─── Filter Form ────────────────────────────────────────────────

  private initFilterForm(): void {
    this.filterForm = this._fb.group({
      searchQuery: [''],
      selectedStatuses: this._fb.array([]),
      selectedGrantTypes: this._fb.array([]),
      certifiedOnly: [false],
    });

    // React to form value changes for real-time filtering
    this.filterForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.applyFilters());
  }

  get selectedStatuses(): FormArray {
    return this.filterForm.get('selectedStatuses') as FormArray;
  }

  get selectedGrantTypes(): FormArray {
    return this.filterForm.get('selectedGrantTypes') as FormArray;
  }

  toggleStatus(status: string): void {
    const index = this.selectedStatuses.controls.findIndex(c => c.value === status);
    if (index > -1) {
      this.selectedStatuses.removeAt(index);
    } else {
      this.selectedStatuses.push(new FormControl(status));
    }
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses.controls.some(c => c.value === status);
  }

  toggleGrantType(grantType: string): void {
    const index = this.selectedGrantTypes.controls.findIndex(c => c.value === grantType);
    if (index > -1) {
      this.selectedGrantTypes.removeAt(index);
    } else {
      this.selectedGrantTypes.push(new FormControl(grantType));
    }
  }

  isGrantTypeSelected(grantType: string): boolean {
    return this.selectedGrantTypes.controls.some(c => c.value === grantType);
  }

  filterByStatus(status: string): void {
    this.selectedStatuses.clear();
    if (status !== 'all') {
      this.selectedStatuses.push(new FormControl(status));
    }
  }

  resetFilters(): void {
    this.filterForm.reset({ searchQuery: '', certifiedOnly: false });
    this.selectedStatuses.clear();
    this.selectedGrantTypes.clear();
  }

  // ─── Edit Form ──────────────────────────────────────────────────

  private initEditForm(): void {
    this.editForm = this._fb.group({
      applicationName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      applicationDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      contactPersonName: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', [Validators.required]],
      officialEmail: ['', [Validators.required, Validators.email]],
      businessUrl: ['', [Validators.required, this.urlValidator]],
      registeredBusinessAddress: ['', [Validators.required, Validators.minLength(10)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(5)]],
      allowedGrant: ['', [Validators.required]],
      sandboxUrl: ['', [this.urlValidator]],
      isCertified: [false],
      comments: ['', [Validators.maxLength(1000)]],
      redirectUrls: this._fb.array([], [Validators.required, this.minArrayLength(1)]),
      selectedPlans: this._fb.array([], [this.minArrayLength(1)]),
    });
  }

  get editRedirectUrls(): FormArray {
    return this.editForm.get('redirectUrls') as FormArray;
  }

  get editSelectedPlans(): FormArray {
    return this.editForm.get('selectedPlans') as FormArray;
  }

  // ─── Custom Validators ──────────────────────────────────────────

  urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    try {
      const url = new URL(control.value);
      return (url.protocol === 'http:' || url.protocol === 'https:') ? null : { invalidUrl: true };
    } catch {
      return { invalidUrl: true };
    }
  }

  minArrayLength(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control instanceof FormArray) {
        return control.length >= min ? null : { minArrayLength: { requiredLength: min, actualLength: control.length } };
      }
      return null;
    };
  }

  // ─── Inline Editing ─────────────────────────────────────────────

  startEditing(provider: Provider): void {
    this.editingProviderId = provider.id;

    // Populate the edit form with provider data
    this.editForm.patchValue({
      applicationName: provider.applicationName,
      applicationDescription: provider.applicationDescription,
      contactPersonName: provider.contactPersonName,
      designation: provider.designation,
      officialEmail: provider.officialEmail,
      businessUrl: provider.businessUrl,
      registeredBusinessAddress: provider.registeredBusinessAddress,
      licenseNumber: provider.licenseNumber,
      allowedGrant: provider.allowedGrant,
      sandboxUrl: provider.sandboxUrl,
      isCertified: provider.isCertified,
      comments: provider.comments,
    });

    // Populate redirect URLs FormArray
    this.editRedirectUrls.clear();
    provider.redirectUrls.forEach(url => {
      this.editRedirectUrls.push(new FormControl(url, [Validators.required, this.urlValidator]));
    });

    // Populate selected plans FormArray
    this.editSelectedPlans.clear();
    provider.selectedPlans.forEach(planId => {
      this.editSelectedPlans.push(new FormControl(planId));
    });
  }

  cancelEditing(): void {
    this.editingProviderId = null;
    this.editForm.reset();
    this.editRedirectUrls.clear();
    this.editSelectedPlans.clear();
  }

  addRedirectUrl(): void {
    this.editRedirectUrls.push(new FormControl('', [Validators.required, this.urlValidator]));
  }

  removeRedirectUrl(index: number): void {
    this.editRedirectUrls.removeAt(index);
  }

  toggleEditPlan(planId: number): void {
    const index = this.editSelectedPlans.controls.findIndex(c => c.value === planId);
    if (index > -1) {
      this.editSelectedPlans.removeAt(index);
    } else {
      this.editSelectedPlans.push(new FormControl(planId));
    }
  }

  isEditPlanSelected(planId: number): boolean {
    return this.editSelectedPlans.controls.some(c => c.value === planId);
  }

  saveProvider(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      const errors = this.getFormErrors();
      this._toastService.warning('Validation Error', errors.join(', '));
      return;
    }

    if (!this.editingProviderId) return;

    const formValue = this.editForm.value;
    const updateData: Partial<Provider> = {
      applicationName: formValue.applicationName,
      applicationDescription: formValue.applicationDescription,
      contactPersonName: formValue.contactPersonName,
      designation: formValue.designation,
      officialEmail: formValue.officialEmail,
      businessUrl: formValue.businessUrl,
      registeredBusinessAddress: formValue.registeredBusinessAddress,
      licenseNumber: formValue.licenseNumber,
      allowedGrant: formValue.allowedGrant,
      sandboxUrl: formValue.sandboxUrl,
      isCertified: formValue.isCertified,
      comments: formValue.comments,
      redirectUrls: formValue.redirectUrls,
      selectedPlans: formValue.selectedPlans,
    };

    this._providersService
      .updateProvider(this.editingProviderId, updateData)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (updated) => {
          const index = this.providers.findIndex(p => p.id === updated.id);
          if (index > -1) {
            this.providers[index] = updated;
            this.applyFilters();
          }
          this._toastService.success('Provider Updated', `"${updated.applicationName}" has been updated.`);
          this.cancelEditing();
        },
        error: () => {
          this._toastService.error('Update Failed', 'Failed to update provider. Please try again.');
        },
      });
  }

  private getFormErrors(): string[] {
    const errors: string[] = [];
    const controls = this.editForm.controls;

    if (controls['applicationName'].errors) {
      if (controls['applicationName'].errors['required']) errors.push('Application name is required');
      if (controls['applicationName'].errors['minlength']) errors.push('Application name must be at least 3 characters');
    }
    if (controls['applicationDescription'].errors) {
      if (controls['applicationDescription'].errors['required']) errors.push('Description is required');
      if (controls['applicationDescription'].errors['minlength']) errors.push('Description must be at least 10 characters');
    }
    if (controls['officialEmail'].errors) {
      if (controls['officialEmail'].errors['required']) errors.push('Email is required');
      if (controls['officialEmail'].errors['email']) errors.push('Email must be valid');
    }
    if (controls['businessUrl'].errors) {
      if (controls['businessUrl'].errors['required']) errors.push('Business URL is required');
      if (controls['businessUrl'].errors['invalidUrl']) errors.push('Business URL must be a valid URL');
    }
    if (controls['allowedGrant'].errors) {
      errors.push('Grant type is required');
    }
    if (this.editRedirectUrls.length === 0) {
      errors.push('At least one redirect URL is required');
    }

    return errors.length > 0 ? errors : ['Please fix all validation errors'];
  }

  // ─── Data Loading ───────────────────────────────────────────────

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

  // ─── Filtering ──────────────────────────────────────────────────

  applyFilters(): void {
    let filtered = [...this.providers];
    const formValue = this.filterForm.value;

    // Filter by status
    const statuses: string[] = formValue.selectedStatuses || [];
    if (statuses.length > 0) {
      filtered = filtered.filter(p => statuses.includes(p.status));
    }

    // Filter by grant type
    const grantTypes: string[] = formValue.selectedGrantTypes || [];
    if (grantTypes.length > 0) {
      filtered = filtered.filter(p => grantTypes.includes(p.allowedGrant));
    }

    // Filter by certified
    if (formValue.certifiedOnly) {
      filtered = filtered.filter(p => p.isCertified);
    }

    // Filter by search query
    const query = (formValue.searchQuery || '').toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(
        provider =>
          provider.applicationName.toLowerCase().includes(query) ||
          provider.applicationDescription.toLowerCase().includes(query) ||
          provider.contactPersonName.toLowerCase().includes(query) ||
          provider.officialEmail.toLowerCase().includes(query),
      );
    }

    this.filteredProviders = filtered;
  }

  // ─── Navigation & Actions ───────────────────────────────────────

  viewProvider(provider: Provider): void {
    this._router.navigate(['/products/view', provider.id]);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'approved': return 'bg-info';
      case 'rejected': return 'bg-danger';
      case 'suspended': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getGrantTypeLabel(grantType: string): string {
    switch (grantType) {
      case 'authorization_code': return 'Authorization Code';
      case 'client_credentials': return 'Client Credentials';
      case 'implicit': return 'Implicit';
      default: return grantType;
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

  getStatusCount(status: string): number {
    return this.providers.filter(p => p.status === status).length;
  }

  getGrantTypeCount(grantType: string): number {
    return this.providers.filter(p => p.allowedGrant === grantType).length;
  }

  getCertifiedCount(): number {
    return this.providers.filter(p => p.isCertified).length;
  }

  viewCredentials(provider: Provider): void {
    this._toastService.info('View Credentials', `Viewing credentials for ${provider.applicationName}`);
  }

  deactivateProvider(provider: Provider): void {
    if (provider.status === 'suspended' || provider.status === 'rejected') {
      this._toastService.warning('Deactivate Provider', 'This provider is already inactive');
      return;
    }
    this._router.navigate(['/products/view', provider.id]);
  }

  // ─── Form Helper ────────────────────────────────────────────────

  hasFieldError(controlName: string): boolean {
    const control = this.editForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.editForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
    if (control.errors['email']) return 'Invalid email address';
    if (control.errors['invalidUrl']) return 'Must be a valid URL (http/https)';
    return 'Invalid value';
  }
}

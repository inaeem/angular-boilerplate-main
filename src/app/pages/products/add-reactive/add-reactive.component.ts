import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from '../services/products.service';
import { PlansService } from '../services/plans.service';
import { Product, Plan } from '../entities';
import { ToastService } from '@shared/services/toast.service';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  file: File;
}

@UntilDestroy()
@Component({
  selector: 'app-add-reactive',
  templateUrl: './add-reactive.component.html',
  styleUrls: ['./add-reactive.component.scss'],
  standalone: false,
})
export class AddReactiveComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  isEditMode = false;
  providerId: number | null = null;
  isLoading = false;
  isLoadingPlans = false;
  stepSubmitted = false;

  // Plan selection UI mode
  planSelectionMode: 'grid' | 'dropdown' = 'grid';
  isPlansDropdownOpen = false;

  // Logo and file data (not in FormGroup since they're file objects)
  logoFile: UploadedFile | null = null;
  additionalFiles: UploadedFile[] = [];

  // Plans loaded from API
  plans: Plan[] = [];

  grantTypes = [
    { value: 'implicit', label: 'Implicit Grant' },
    { value: 'authorization', label: 'Authorization Code Grant' },
  ];

  providerTypes = [
    {
      value: 'individual',
      label: 'Individual Provider',
      icon: 'ti-user',
      description: 'Register as a single provider operating independently. Best suited for solo practitioners, freelancers, or small businesses with a single point of contact.',
    },
    {
      value: 'group',
      label: 'Provider Group',
      icon: 'ti-users-group',
      description: 'Register as a group or organization representing multiple providers under one entity. Ideal for clinics, agencies, or enterprises managing multiple service lines.',
    },
  ];

  groupTypes = [
    { value: 'clinic', label: 'Clinic / Medical Practice' },
    { value: 'agency', label: 'Agency / Brokerage' },
    { value: 'enterprise', label: 'Enterprise / Corporation' },
    { value: 'cooperative', label: 'Cooperative / Consortium' },
    { value: 'franchise', label: 'Franchise Network' },
    { value: 'other', label: 'Other' },
  ];

  // Reactive form
  providerForm!: FormGroup;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _productsService: ProductsService,
    private readonly _plansService: PlansService,
    private readonly _toastService: ToastService,
    private readonly _translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPlans();

    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.providerId = parseInt(id, 10);
      this.loadProductData(this.providerId);
    }
  }

  // ─── Form Initialization ───────────────────────────────────────

  private initForm(): void {
    this.providerForm = this._fb.group({
      // Step 1: Provider Type Selection
      providerType: ['', [Validators.required]],
      providerGroupName: [''],
      groupRegistrationNumber: [''],
      groupType: [''],
      numberOfProviders: [null as number | null],
      numberOfLocations: [null as number | null],
      complianceOfficerName: [''],
      complianceOfficerEmail: [''],

      // Step 1: Application Information
      applicationName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      applicationDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      businessUrl: ['', [Validators.required, this.urlValidator]],
      registeredBusinessAddress: ['', [Validators.required, Validators.minLength(5)]],
      contactPersonName: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', [Validators.required]],
      officialEmail: ['', [Validators.required, Validators.email]],
      selectedPlans: this._fb.array([], [this.minArrayLength(1)]),

      // Step 2: Personal Information
      licenseNumber: ['', [Validators.required, Validators.minLength(5)]],
      dateOfBirth: ['', [Validators.required]],
      age: [{ value: null as number | null, disabled: true }],

      // Step 3: Authorization and Scopes
      allowedGrant: ['', [Validators.required]],
      redirectUrls: this._fb.array([], [this.minArrayLength(1)]),

      // Step 4: Preview and Submit
      comments: ['', [Validators.maxLength(1000)]],
      sandboxUrl: ['', [this.optionalUrlValidator]],
      isCertified: [false],
    });

    // Auto-calculate age when dateOfBirth changes
    this.providerForm.get('dateOfBirth')!.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(dob => this.calculateAge(dob));

    // Swap group-field validators when provider type changes
    this.providerForm.get('providerType')!.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(type => this.updateGroupValidators(type === 'group'));
  }

  private updateGroupValidators(isGroup: boolean): void {
    const validatorMap: Record<string, any[]> = {
      providerGroupName: [Validators.required, Validators.minLength(3)],
      groupRegistrationNumber: [Validators.required, Validators.minLength(3)],
      groupType: [Validators.required],
      numberOfProviders: [Validators.required, Validators.min(2)],
      numberOfLocations: [Validators.required, Validators.min(1)],
      complianceOfficerName: [Validators.required, Validators.minLength(2)],
      complianceOfficerEmail: [Validators.required, Validators.email],
    };

    Object.keys(validatorMap).forEach(field => {
      const control = this.providerForm.get(field);
      if (!control) return;
      if (isGroup) {
        control.setValidators(validatorMap[field]);
      } else {
        control.clearValidators();
        const resetValue = field === 'numberOfProviders' || field === 'numberOfLocations' ? null : '';
        control.setValue(resetValue, { emitEvent: false });
      }
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  // ─── Form Accessors ────────────────────────────────────────────

  get selectedPlans(): FormArray {
    return this.providerForm.get('selectedPlans') as FormArray;
  }

  get redirectUrls(): FormArray {
    return this.providerForm.get('redirectUrls') as FormArray;
  }

  // ─── Custom Validators ─────────────────────────────────────────

  urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    try {
      const url = new URL(control.value);
      return (url.protocol === 'http:' || url.protocol === 'https:') ? null : { invalidUrl: true };
    } catch {
      return { invalidUrl: true };
    }
  }

  optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') return null;
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

  ageMinValidator(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return { required: true };
      return control.value >= min ? null : { ageMin: { requiredAge: min, actualAge: control.value } };
    };
  }

  // ─── Step Fields Mapping ───────────────────────────────────────

  private getStepFields(step: number): string[] {
    switch (step) {
      case 1:
        return ['providerType', 'providerGroupName', 'groupRegistrationNumber', 'groupType',
                'numberOfProviders', 'numberOfLocations', 'complianceOfficerName', 'complianceOfficerEmail',
                'applicationName', 'applicationDescription', 'businessUrl', 'registeredBusinessAddress',
                'contactPersonName', 'designation', 'officialEmail', 'selectedPlans'];
      case 2:
        return ['licenseNumber', 'dateOfBirth', 'age'];
      case 3:
        return ['allowedGrant', 'redirectUrls'];
      case 4:
        return ['comments', 'sandboxUrl', 'isCertified'];
      default:
        return [];
    }
  }

  // ─── Step Validation ───────────────────────────────────────────

  isStepValid(step: number): boolean {
    const fields = this.getStepFields(step);
    const allFieldsValid = fields.every(field => {
      const control = this.providerForm.get(field);
      if (!control) return true;
      return control.valid;
    });

    // Step 1: also check logo
    if (step === 1 && !this.logoFile) return false;

    // Step 2: also check age >= 18
    if (step === 2) {
      const age = this.providerForm.get('age')!.value;
      if (age === null || age < 18) return false;
    }

    // Step 4: all previous steps must be valid
    if (step === 4) {
      return this.isStepValid(1) && this.isStepValid(2) && this.isStepValid(3);
    }

    return allFieldsValid;
  }

  canProceed(): boolean {
    return this.isStepValid(this.currentStep);
  }

  markStepAsTouched(step: number): void {
    const fields = this.getStepFields(step);
    fields.forEach(field => {
      const control = this.providerForm.get(field);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        if (control instanceof FormArray) {
          control.controls.forEach(c => {
            c.markAsTouched();
            c.markAsDirty();
          });
        }
      }
    });
  }

  getStepErrors(step: number): string[] {
    const errors: string[] = [];

    switch (step) {
      case 1: {
        const name = this.providerForm.get('applicationName')!;
        if (name.hasError('required')) errors.push('Application name is required');
        else if (name.hasError('minlength')) errors.push('Application name must be at least 3 characters');

        const desc = this.providerForm.get('applicationDescription')!;
        if (desc.hasError('required')) errors.push('Description is required');
        else if (desc.hasError('minlength')) errors.push('Description must be at least 10 characters');

        const url = this.providerForm.get('businessUrl')!;
        if (url.hasError('required')) errors.push('Business URL is required');
        else if (url.hasError('invalidUrl')) errors.push('Business URL must be a valid URL');

        if (this.providerForm.get('registeredBusinessAddress')!.hasError('required'))
          errors.push('Registered business address is required');
        if (this.providerForm.get('contactPersonName')!.hasError('required'))
          errors.push('Contact person name is required');
        if (this.providerForm.get('designation')!.hasError('required'))
          errors.push('Designation is required');

        const email = this.providerForm.get('officialEmail')!;
        if (email.hasError('required')) errors.push('Official email is required');
        else if (email.hasError('email')) errors.push('Official email must be valid');

        if (!this.logoFile) errors.push('Logo file is required');
        if (this.selectedPlans.length === 0) errors.push('At least one plan must be selected');
        break;
      }
      case 2: {
        const lic = this.providerForm.get('licenseNumber')!;
        if (lic.hasError('required')) errors.push('License number is required');
        else if (lic.hasError('minlength')) errors.push('License number must be at least 5 characters');

        if (this.providerForm.get('dateOfBirth')!.hasError('required'))
          errors.push('Date of birth is required');

        const age = this.providerForm.get('age')!.value;
        if (age === null) errors.push('Age must be calculated from date of birth');
        else if (age < 18) errors.push('Applicant must be at least 18 years old');
        break;
      }
      case 3: {
        if (this.providerForm.get('allowedGrant')!.hasError('required'))
          errors.push('Grant type selection is required');
        if (this.redirectUrls.length === 0)
          errors.push('At least one redirect URL is required');
        else {
          this.redirectUrls.controls.forEach((ctrl, i) => {
            if (ctrl.hasError('invalidUrl')) errors.push(`Redirect URL ${i + 1} is not valid`);
          });
        }
        break;
      }
      case 4: {
        if (!this.isStepValid(1)) errors.push('Application information is incomplete');
        if (!this.isStepValid(2)) errors.push('Personal information is incomplete');
        if (!this.isStepValid(3)) errors.push('Authorization and scopes information is incomplete');
        break;
      }
    }

    return errors.length > 0 ? errors : ['Please complete all required fields'];
  }

  // ─── Step Navigation ───────────────────────────────────────────

  nextStep(): void {
    this.stepSubmitted = true;

    if (!this.isStepValid(this.currentStep)) {
      const errors = this.getStepErrors(this.currentStep);
      this._toastService.warning(
        this._translateService.instant('Validation Error'),
        errors.join(', ')
      );
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.stepSubmitted = false;
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.stepSubmitted = false;
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.stepSubmitted = false;
      this.currentStep = step;
      window.scrollTo(0, 0);
    }
  }

  // ─── Age Calculation ───────────────────────────────────────────

  private calculateAge(dob: string): void {
    if (!dob) {
      this.providerForm.get('age')!.setValue(null);
      return;
    }
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.providerForm.get('age')!.setValue(age >= 0 ? age : null);
  }

  // ─── Plan Selection ────────────────────────────────────────────

  togglePlan(planId: number): void {
    const index = this.selectedPlans.controls.findIndex(c => c.value === planId);
    if (index > -1) {
      this.selectedPlans.removeAt(index);
    } else {
      this.selectedPlans.push(new FormControl(planId));
    }
  }

  isPlanSelected(planId: number): boolean {
    return this.selectedPlans.controls.some(c => c.value === planId);
  }

  toggleAllPlans(): void {
    if (this.areAllPlansSelected()) {
      this.selectedPlans.clear();
    } else {
      this.selectedPlans.clear();
      this.plans.forEach(plan => this.selectedPlans.push(new FormControl(plan.id)));
    }
  }

  areAllPlansSelected(): boolean {
    return this.plans.length > 0 && this.selectedPlans.length === this.plans.length;
  }

  togglePlansDropdown(): void {
    this.isPlansDropdownOpen = !this.isPlansDropdownOpen;
  }

  getSelectedPlanNames(): string {
    if (this.selectedPlans.length === 0) {
      return this._translateService.instant('Select plans...');
    }
    const selectedIds = this.selectedPlans.controls.map(c => c.value);
    const selectedNames = this.plans
      .filter(plan => selectedIds.includes(plan.id))
      .map(plan => plan.name);

    if (selectedNames.length <= 2) {
      return selectedNames.join(', ');
    }
    return `${selectedNames[0]}, ${selectedNames[1]} +${selectedNames.length - 2} more`;
  }

  // ─── Redirect URL Management ───────────────────────────────────

  tempRedirectUrl = '';

  addRedirectUrl(): void {
    if (this.tempRedirectUrl && this.isValidUrl(this.tempRedirectUrl)) {
      const exists = this.redirectUrls.controls.some(c => c.value === this.tempRedirectUrl);
      if (exists) {
        this._toastService.warning('Duplicate URL', 'This redirect URL already exists.');
        return;
      }
      this.redirectUrls.push(new FormControl(this.tempRedirectUrl, [Validators.required, this.urlValidator]));
      this.tempRedirectUrl = '';
    } else {
      this._toastService.warning('Invalid URL', 'Please enter a valid redirect URL.');
    }
  }

  removeRedirectUrl(index: number): void {
    this.redirectUrls.removeAt(index);
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // ─── Logo File Upload ──────────────────────────────────────────

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this._toastService.error('Invalid File Type', 'Please upload an image file (PNG, JPG, etc.)');
        input.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this._toastService.error('File Too Large', 'Logo file must be less than 5MB');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string,
          file: file,
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoFile = null;
  }

  // ─── Additional Files Upload ───────────────────────────────────

  onAdditionalFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      files.forEach((file) => {
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          this._toastService.warning('File Too Large', `${file.name} exceeds 10MB limit`);
          return;
        }

        const isDuplicate = this.additionalFiles.some((f) => f.name === file.name && f.size === file.size);
        if (isDuplicate) {
          this._toastService.warning('Duplicate File', `${file.name} has already been added`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.additionalFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string,
            file: file,
          });
        };
        reader.readAsDataURL(file);
      });

      input.value = '';
    }
  }

  removeAdditionalFile(index: number): void {
    this.additionalFiles.splice(index, 1);
  }

  // ─── Data Loading ──────────────────────────────────────────────

  loadPlans(): void {
    this.isLoadingPlans = true;
    this._plansService
      .getPlans()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (plans) => {
          this.plans = plans;
          this.isLoadingPlans = false;
        },
        error: (error) => {
          console.error('Error loading plans:', error);
          this.isLoadingPlans = false;
          this._toastService.error('Failed to Load Plans', 'Could not load application plans. Please refresh the page.');
        },
      });
  }

  loadProductData(id: number): void {
    this.isLoading = true;
    this._productsService
      .getProductById(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (product) => {
          if (product) {
            this.providerForm.patchValue({
              applicationName: product.name || '',
              applicationDescription: product.description || '',
              businessUrl: product.category || '',
              registeredBusinessAddress: product.description || '',
              contactPersonName: '',
              designation: '',
              officialEmail: '',
              licenseNumber: '',
              dateOfBirth: '',
              allowedGrant: '',
              comments: '',
              sandboxUrl: '',
              isCertified: false,
            });

            if (product.image) {
              this.logoFile = {
                name: 'product-image.jpg',
                size: 0,
                type: 'image/jpeg',
                dataUrl: product.image,
                file: null as any,
              };
            }

            this.isLoading = false;
            this._toastService.info(
              this._translateService.instant('Load Successful'),
              `Loaded product "${product.name}" for editing.`
            );
          } else {
            this.isLoading = false;
            this._toastService.error(this._translateService.instant('Load Failed'), 'Product not found.');
            this._router.navigate(['/products']);
          }
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.isLoading = false;
          this._toastService.error(
            this._translateService.instant('Load Failed'),
            this._translateService.instant('Failed to load product details.')
          );
          this._router.navigate(['/products']);
        },
      });
  }

  // ─── Submit ────────────────────────────────────────────────────

  submitProvider(): void {
    this.stepSubmitted = true;

    if (!this.isStepValid(4)) {
      const errors = this.getStepErrors(4);
      this._toastService.error(
        'Validation Failed',
        'Please fix all validation errors before submitting. ' + errors.join('; ')
      );

      for (let step = 1; step <= 3; step++) {
        if (!this.isStepValid(step)) {
          this.currentStep = step;
          window.scrollTo(0, 0);
          break;
        }
      }
      return;
    }

    const formValue = this.providerForm.getRawValue();

    const productData: Partial<Product> = {
      name: formValue.applicationName,
      description: formValue.applicationDescription,
      category: formValue.businessUrl,
      price: 0,
      image: this.logoFile?.dataUrl || '',
      stock: 100,
      rating: 4.5,
      isFavorite: false,
      deprecated: false,
      status: 'in-stock',
    };

    this.isLoading = true;

    if (this.isEditMode && this.providerId) {
      this._productsService
        .updateProduct(this.providerId, productData)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (updatedProduct) => {
            this.isLoading = false;
            this._toastService.success(
              this._translateService.instant('Product Updated'),
              `"${updatedProduct.name}" has been successfully updated.`
            );
            this._router.navigate(['/products']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.isLoading = false;
            this._toastService.error(
              this._translateService.instant('Update Failed'),
              'An error occurred while updating the product.'
            );
          },
        });
    } else {
      this._productsService
        .createProduct(productData)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (newProduct) => {
            this.isLoading = false;
            this._toastService.success(
              this._translateService.instant('Product Created'),
              `"${newProduct.name}" has been successfully created.`
            );
            this._router.navigate(['/products']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.isLoading = false;
            this._toastService.error(
              this._translateService.instant('Creation Failed'),
              'An error occurred while creating the product.'
            );
          },
        });
    }
  }

  cancel(): void {
    if (this.providerForm.dirty) {
      const confirmed = confirm('Are you sure you want to cancel? All changes will be lost.');
      if (!confirmed) return;
    }
    this._router.navigate(['/products']);
  }

  // ─── Utility Methods ───────────────────────────────────────────

  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Application Information';
      case 2: return 'Personal Information';
      case 3: return 'Authorization and Scopes';
      case 4: return 'Preview and Submit';
      default: return '';
    }
  }

  getStepIcon(step: number): string {
    switch (step) {
      case 1: return 'ti-briefcase';
      case 2: return 'ti-user';
      case 3: return 'ti-lock';
      case 4: return 'ti-check';
      default: return 'ti-circle';
    }
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'ti-photo';
    if (type.includes('pdf')) return 'ti-file-text';
    if (type.includes('word') || type.includes('document')) return 'ti-file-text';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'ti-table';
    if (type.includes('zip') || type.includes('archive')) return 'ti-file-zip';
    return 'ti-file';
  }

  // ─── Form Error Helpers ────────────────────────────────────────

  hasFieldError(controlName: string): boolean {
    const control = this.providerForm.get(controlName);
    return !!(this.stepSubmitted && control && control.invalid);
  }

  getFieldError(controlName: string): string {
    const control = this.providerForm.get(controlName);
    if (!this.stepSubmitted || !control || !control.errors) return '';

    if (control.errors['required']) return this._translateService.instant('This field is required');
    if (control.errors['minlength']) {
      const required = control.errors['minlength'].requiredLength;
      return this._translateService.instant('Minimum') + ` ${required} ` + this._translateService.instant('characters');
    }
    if (control.errors['maxlength']) {
      const required = control.errors['maxlength'].requiredLength;
      return this._translateService.instant('Maximum') + ` ${required} ` + this._translateService.instant('characters');
    }
    if (control.errors['email']) return this._translateService.instant('Please enter a valid email address');
    if (control.errors['invalidUrl']) return this._translateService.instant('Please enter a valid URL (http/https)');
    return this._translateService.instant('Invalid value');
  }

  getCharCount(controlName: string): number {
    return (this.providerForm.get(controlName)?.value || '').length;
  }
}

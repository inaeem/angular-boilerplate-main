import { Component, OnInit } from '@angular/core';
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

interface ProviderFormData {
  // Step 1: Application Information
  providerType: 'individual' | 'group' | '';
  providerGroupName: string;
  groupRegistrationNumber: string;
  groupType: string;
  numberOfProviders: number | null;
  numberOfLocations: number | null;
  complianceOfficerName: string;
  complianceOfficerEmail: string;
  applicationName: string;
  applicationDescription: string;
  businessUrl: string;
  registeredBusinessAddress: string;
  contactPersonName: string;
  designation: string;
  officialEmail: string;
  logo: UploadedFile | null;
  selectedPlans: number[]; // Changed to array of plan IDs

  // Step 2: Personal Information
  licenseNumber: string;
  dateOfBirth: string;
  age: number | null;

  // Step 3: Authorization and Scopes
  allowedGrant: 'implicit' | 'authorization' | '';
  redirectUrls: string[];

  // Step 4: Preview and Submit
  comments: string;
  sandboxUrl: string;
  isCertified: boolean;
  additionalFiles: UploadedFile[];
}

@UntilDestroy()
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  standalone: false,
})
export class AddComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  isEditMode = false;
  providerId: number | null = null;
  isLoading = false;
  isLoadingPlans = false;

  // Plan selection UI mode: 'grid' or 'dropdown'
  planSelectionMode: 'grid' | 'dropdown' = 'grid'; // Change to 'dropdown' to use dropdown mode
  isPlansDropdownOpen = false;

  // Validation tracking
  attemptedNext = false;
  stepAttempted: { [key: number]: boolean } = {};

  // Temporary inputs for arrays
  tempRedirectUrl = '';

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

  formData: ProviderFormData = {
    // Step 1
    providerType: '',
    providerGroupName: '',
    groupRegistrationNumber: '',
    groupType: '',
    numberOfProviders: null,
    numberOfLocations: null,
    complianceOfficerName: '',
    complianceOfficerEmail: '',
    applicationName: '',
    applicationDescription: '',
    businessUrl: '',
    registeredBusinessAddress: '',
    contactPersonName: '',
    designation: '',
    officialEmail: '',
    logo: null,
    selectedPlans: [], // Changed to empty array

    // Step 2
    licenseNumber: '',
    dateOfBirth: '',
    age: null,

    // Step 3
    allowedGrant: '',
    redirectUrls: [],

    // Step 4
    comments: '',
    sandboxUrl: '',
    isCertified: false,
    additionalFiles: [],
  };

  // Plans loaded from API
  plans: Plan[] = [];

  grantTypes = [
    { value: 'implicit', label: 'Implicit Grant' },
    { value: 'authorization', label: 'Authorization Code Grant' },
  ];

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _productsService: ProductsService,
    private readonly _plansService: PlansService,
    private readonly _toastService: ToastService,
    private readonly _translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    // Load plans from API
    this.loadPlans();

    // Check if we're in edit mode
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.providerId = parseInt(id, 10);
      this.loadProductData(this.providerId);
    }
  }

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
          this._toastService.error(
            'Failed to Load Plans',
            'Could not load application plans. Please refresh the page.'
          );
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
            // Map product data to form data
            this.formData = {
              // Step 1: Application Information
              providerType: 'individual',
              providerGroupName: '',
              groupRegistrationNumber: '',
              groupType: '',
              numberOfProviders: null,
              numberOfLocations: null,
              complianceOfficerName: '',
              complianceOfficerEmail: '',
              applicationName: product.name || '',
              applicationDescription: product.description || '',
              businessUrl: product.category || '',
              registeredBusinessAddress: product.description || '',
              contactPersonName: '',
              designation: '',
              officialEmail: '',
              logo: product.image ? {
                name: 'product-image.jpg',
                size: 0,
                type: 'image/jpeg',
                dataUrl: product.image,
                file: null as any
              } : null,
              selectedPlans: [], // Initialize as empty array for edit mode

              // Step 2: Personal Information
              licenseNumber: '',
              dateOfBirth: '',
              age: null,

              // Step 3: Authorization and Scopes
              allowedGrant: '',
              redirectUrls: [],

              // Step 4: Preview and Submit
              comments: '',
              sandboxUrl: '',
              isCertified: false,
              additionalFiles: [],
            };
            this.isLoading = false;
            this._toastService.info(
              this._translateService.instant('Load Successful'),
              `Loaded product "${product.name}" for editing.`
            );
          } else {
            this.isLoading = false;
            this._toastService.error(
              this._translateService.instant('Load Failed'),
              'Product not found.'
            );
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

  // Calculate age from date of birth
  calculateAge(): void {
    if (this.formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(this.formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      this.formData.age = age >= 0 ? age : null;
    }
  }

  nextStep(): void {
    this.stepAttempted[this.currentStep] = true;

    if (!this.isStepValid(this.currentStep)) {
      const errors = this.getStepErrors(this.currentStep);
      this._toastService.warning(
        this._translateService.instant('Validation Error'),
        errors.join(', ')
      );
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.attemptedNext = false;
      window.scrollTo(0, 0);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      window.scrollTo(0, 0);
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        // Step 1: Application Information
        const providerTypeValid = !!this.formData.providerType;
        const isGroup = this.formData.providerType === 'group';
        const groupFieldsValid = !isGroup || !!(
          this.formData.providerGroupName && this.formData.providerGroupName.trim().length >= 3 &&
          this.formData.groupRegistrationNumber && this.formData.groupRegistrationNumber.trim().length >= 3 &&
          this.formData.groupType &&
          this.formData.numberOfProviders !== null && this.formData.numberOfProviders >= 2 &&
          this.formData.numberOfLocations !== null && this.formData.numberOfLocations >= 1 &&
          this.formData.complianceOfficerName && this.formData.complianceOfficerName.trim().length >= 2 &&
          this.formData.complianceOfficerEmail && this.isValidEmail(this.formData.complianceOfficerEmail)
        );
        return !!(
          providerTypeValid &&
          groupFieldsValid &&
          this.formData.applicationName &&
          this.formData.applicationName.trim().length >= 3 &&
          this.formData.applicationDescription &&
          this.formData.applicationDescription.trim().length >= 10 &&
          this.formData.businessUrl &&
          this.isValidUrl(this.formData.businessUrl) &&
          this.formData.registeredBusinessAddress &&
          this.formData.contactPersonName &&
          this.formData.designation &&
          this.formData.officialEmail &&
          this.isValidEmail(this.formData.officialEmail) &&
          this.formData.logo &&
          this.formData.selectedPlans.length > 0
        );
      case 2:
        // Step 2: Personal Information
        return !!(
          this.formData.licenseNumber &&
          this.formData.licenseNumber.trim().length >= 5 &&
          this.formData.dateOfBirth &&
          this.formData.age !== null &&
          this.formData.age >= 18
        );
      case 3:
        // Step 3: Authorization and Scopes
        return !!(
          this.formData.allowedGrant &&
          this.formData.redirectUrls.length > 0 &&
          this.formData.redirectUrls.every((url) => this.isValidUrl(url))
        );
      case 4:
        // Step 4: Preview and Submit - all previous steps must be valid
        return this.isStepValid(1) && this.isStepValid(2) && this.isStepValid(3);
      default:
        return false;
    }
  }

  canProceed(): boolean {
    return this.isStepValid(this.currentStep);
  }

  getStepErrors(step: number): string[] {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!this.formData.providerType) {
          errors.push('Provider type must be selected');
        }
        if (this.formData.providerType === 'group') {
          if (!this.formData.providerGroupName || this.formData.providerGroupName.trim().length < 3) {
            errors.push('Provider group name must be at least 3 characters');
          }
          if (!this.formData.groupRegistrationNumber || this.formData.groupRegistrationNumber.trim().length < 3) {
            errors.push('Group registration number is required');
          }
          if (!this.formData.groupType) {
            errors.push('Group type must be selected');
          }
          if (this.formData.numberOfProviders === null || this.formData.numberOfProviders < 2) {
            errors.push('Number of providers must be at least 2');
          }
          if (this.formData.numberOfLocations === null || this.formData.numberOfLocations < 1) {
            errors.push('Number of locations must be at least 1');
          }
          if (!this.formData.complianceOfficerName || this.formData.complianceOfficerName.trim().length < 2) {
            errors.push('Compliance officer name is required');
          }
          if (!this.formData.complianceOfficerEmail || !this.isValidEmail(this.formData.complianceOfficerEmail)) {
            errors.push('A valid compliance officer email is required');
          }
        }
        if (!this.formData.applicationName || this.formData.applicationName.trim().length < 3) {
          errors.push('Application name must be at least 3 characters');
        }
        if (!this.formData.applicationDescription || this.formData.applicationDescription.trim().length < 10) {
          errors.push('Application description must be at least 10 characters');
        }
        if (!this.formData.businessUrl) {
          errors.push('Business URL is required');
        } else if (!this.isValidUrl(this.formData.businessUrl)) {
          errors.push('Business URL must be a valid URL');
        }
        if (!this.formData.registeredBusinessAddress) {
          errors.push('Registered business address is required');
        }
        if (!this.formData.contactPersonName) {
          errors.push('Contact person name is required');
        }
        if (!this.formData.designation) {
          errors.push('Designation is required');
        }
        if (!this.formData.officialEmail) {
          errors.push('Official email is required');
        } else if (!this.isValidEmail(this.formData.officialEmail)) {
          errors.push('Official email must be valid');
        }
        if (!this.formData.logo) {
          errors.push('Logo file is required');
        }
        if (this.formData.selectedPlans.length === 0) {
          errors.push('At least one plan must be selected');
        }
        break;

      case 2:
        if (!this.formData.licenseNumber || this.formData.licenseNumber.trim().length < 5) {
          errors.push('License number must be at least 5 characters');
        }
        if (!this.formData.dateOfBirth) {
          errors.push('Date of birth is required');
        }
        if (this.formData.age === null) {
          errors.push('Age must be calculated from date of birth');
        } else if (this.formData.age < 18) {
          errors.push('Applicant must be at least 18 years old');
        }
        break;

      case 3:
        if (!this.formData.allowedGrant) {
          errors.push('Grant type selection is required');
        }
        if (this.formData.redirectUrls.length === 0) {
          errors.push('At least one redirect URL is required');
        } else {
          this.formData.redirectUrls.forEach((url, index) => {
            if (!this.isValidUrl(url)) {
              errors.push(`Redirect URL ${index + 1} is not valid`);
            }
          });
        }
        break;

      case 4:
        // Aggregate errors from all previous steps
        if (!this.isStepValid(1)) {
          errors.push('Application information is incomplete');
        }
        if (!this.isStepValid(2)) {
          errors.push('Personal information is incomplete');
        }
        if (!this.isStepValid(3)) {
          errors.push('Authorization and scopes information is incomplete');
        }
        break;
    }

    return errors.length > 0 ? errors : ['Please complete all required fields'];
  }

  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hasFieldError(field: string): boolean {
    const currentStepAttempted = this.stepAttempted[this.currentStep];
    if (!currentStepAttempted) return false;

    switch (field) {
      case 'providerType':
        return !this.formData.providerType;
      case 'providerGroupName':
        return this.formData.providerType === 'group' &&
          (!this.formData.providerGroupName || this.formData.providerGroupName.trim().length < 3);
      case 'groupRegistrationNumber':
        return this.formData.providerType === 'group' &&
          (!this.formData.groupRegistrationNumber || this.formData.groupRegistrationNumber.trim().length < 3);
      case 'groupType':
        return this.formData.providerType === 'group' && !this.formData.groupType;
      case 'numberOfProviders':
        return this.formData.providerType === 'group' &&
          (this.formData.numberOfProviders === null || this.formData.numberOfProviders < 2);
      case 'numberOfLocations':
        return this.formData.providerType === 'group' &&
          (this.formData.numberOfLocations === null || this.formData.numberOfLocations < 1);
      case 'complianceOfficerName':
        return this.formData.providerType === 'group' &&
          (!this.formData.complianceOfficerName || this.formData.complianceOfficerName.trim().length < 2);
      case 'complianceOfficerEmail':
        return this.formData.providerType === 'group' &&
          (!this.formData.complianceOfficerEmail || !this.isValidEmail(this.formData.complianceOfficerEmail));
      case 'applicationName':
        return !this.formData.applicationName || this.formData.applicationName.trim().length < 3;
      case 'applicationDescription':
        return !this.formData.applicationDescription || this.formData.applicationDescription.trim().length < 10;
      case 'businessUrl':
        return !this.formData.businessUrl || !this.isValidUrl(this.formData.businessUrl);
      case 'registeredBusinessAddress':
        return !this.formData.registeredBusinessAddress;
      case 'contactPersonName':
        return !this.formData.contactPersonName;
      case 'designation':
        return !this.formData.designation;
      case 'officialEmail':
        return !this.formData.officialEmail || !this.isValidEmail(this.formData.officialEmail);
      case 'logo':
        return !this.formData.logo;
      case 'selectedPlans':
        return this.formData.selectedPlans.length === 0;
      case 'licenseNumber':
        return !this.formData.licenseNumber || this.formData.licenseNumber.trim().length < 5;
      case 'dateOfBirth':
        return !this.formData.dateOfBirth;
      case 'age':
        return this.formData.age === null || this.formData.age < 18;
      case 'allowedGrant':
        return !this.formData.allowedGrant;
      default:
        return false;
    }
  }

  // Plan Selection Management
  togglePlan(planId: number): void {
    const index = this.formData.selectedPlans.indexOf(planId);
    if (index > -1) {
      // Plan is already selected, remove it
      this.formData.selectedPlans.splice(index, 1);
    } else {
      // Plan is not selected, add it
      this.formData.selectedPlans.push(planId);
    }
  }

  isPlanSelected(planId: number): boolean {
    return this.formData.selectedPlans.includes(planId);
  }

  toggleAllPlans(): void {
    if (this.areAllPlansSelected()) {
      // Deselect all
      this.formData.selectedPlans = [];
    } else {
      // Select all
      this.formData.selectedPlans = this.plans.map(plan => plan.id);
    }
  }

  areAllPlansSelected(): boolean {
    return this.plans.length > 0 && this.formData.selectedPlans.length === this.plans.length;
  }

  togglePlansDropdown(): void {
    this.isPlansDropdownOpen = !this.isPlansDropdownOpen;
  }

  getSelectedPlanNames(): string {
    if (this.formData.selectedPlans.length === 0) {
      return this._translateService.instant('Select plans...');
    }
    const selectedNames = this.plans
      .filter(plan => this.formData.selectedPlans.includes(plan.id))
      .map(plan => plan.name);

    if (selectedNames.length <= 2) {
      return selectedNames.join(', ');
    }
    return `${selectedNames[0]}, ${selectedNames[1]} +${selectedNames.length - 2} more`;
  }

  // Redirect URL Management
  addRedirectUrl(): void {
    if (this.tempRedirectUrl && this.isValidUrl(this.tempRedirectUrl)) {
      if (!this.formData.redirectUrls.includes(this.tempRedirectUrl)) {
        this.formData.redirectUrls.push(this.tempRedirectUrl);
        this.tempRedirectUrl = '';
      } else {
        this._toastService.warning('Duplicate URL', 'This redirect URL already exists.');
      }
    } else {
      this._toastService.warning('Invalid URL', 'Please enter a valid redirect URL.');
    }
  }

  removeRedirectUrl(index: number): void {
    this.formData.redirectUrls.splice(index, 1);
  }

  // Logo File Upload
  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this._toastService.error('Invalid File Type', 'Please upload an image file (PNG, JPG, etc.)');
        input.value = '';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this._toastService.error('File Too Large', 'Logo file must be less than 5MB');
        input.value = '';
        return;
      }

      // Read file and convert to data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.logo = {
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
    this.formData.logo = null;
  }

  // Additional Files Upload
  onAdditionalFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      files.forEach((file) => {
        // Validate file size (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          this._toastService.warning('File Too Large', `${file.name} exceeds 10MB limit`);
          return;
        }

        // Check for duplicates
        const isDuplicate = this.formData.additionalFiles.some((f) => f.name === file.name && f.size === file.size);
        if (isDuplicate) {
          this._toastService.warning('Duplicate File', `${file.name} has already been added`);
          return;
        }

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.additionalFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string,
            file: file,
          });
        };
        reader.readAsDataURL(file);
      });

      // Clear input
      input.value = '';
    }
  }

  removeAdditionalFile(index: number): void {
    this.formData.additionalFiles.splice(index, 1);
  }

  // Utility: Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Utility: Get file icon based on type
  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'ti-photo';
    if (type.includes('pdf')) return 'ti-file-text';
    if (type.includes('word') || type.includes('document')) return 'ti-file-text';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'ti-table';
    if (type.includes('zip') || type.includes('archive')) return 'ti-file-zip';
    return 'ti-file';
  }

  submitProvider(): void {
    // Mark all steps as attempted to show validation errors
    this.stepAttempted[1] = true;
    this.stepAttempted[2] = true;
    this.stepAttempted[3] = true;
    this.stepAttempted[4] = true;

    // Validate all steps
    if (!this.isStepValid(4)) {
      const errors = this.getStepErrors(4);
      this._toastService.error('Validation Failed', 'Please fix all validation errors before submitting. ' + errors.join('; '));

      // Navigate to the first invalid step
      for (let step = 1; step <= 3; step++) {
        if (!this.isStepValid(step)) {
          this.currentStep = step;
          window.scrollTo(0, 0);
          break;
        }
      }
      return;
    }

    // Prepare product data
    const productData: Partial<Product> = {
      name: this.formData.applicationName,
      description: this.formData.applicationDescription,
      category: this.formData.businessUrl,
      price: 0, // Default value
      image: this.formData.logo?.dataUrl || '',
      stock: 100, // Default value
      rating: 4.5, // Default value
      isFavorite: false,
      deprecated: false,
      status: 'in-stock',
    };

    this.isLoading = true;

    if (this.isEditMode && this.providerId) {
      // Update existing product
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
      // Create new product
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
    const confirmed = confirm('Are you sure you want to cancel? All changes will be lost.');
    if (confirmed) {
      this._router.navigate(['/products']);
    }
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1:
        return 'Application Information';
      case 2:
        return 'Personal Information';
      case 3:
        return 'Authorization and Scopes';
      case 4:
        return 'Preview and Submit';
      default:
        return '';
    }
  }

  getStepIcon(step: number): string {
    switch (step) {
      case 1:
        return 'ti-briefcase';
      case 2:
        return 'ti-user';
      case 3:
        return 'ti-lock';
      case 4:
        return 'ti-check';
      default:
        return 'ti-circle';
    }
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}

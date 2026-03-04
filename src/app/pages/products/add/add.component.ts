import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from '../services/products.service';
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
  applicationName: string;
  applicationDescription: string;
  businessUrl: string;
  registeredBusinessAddress: string;
  contactPersonName: string;
  designation: string;
  officialEmail: string;
  logo: UploadedFile | null;
  selectedPlan: string;

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

  // Validation tracking
  attemptedNext = false;
  stepAttempted: { [key: number]: boolean } = {};

  // Temporary inputs for arrays
  tempRedirectUrl = '';

  formData: ProviderFormData = {
    // Step 1
    applicationName: '',
    applicationDescription: '',
    businessUrl: '',
    registeredBusinessAddress: '',
    contactPersonName: '',
    designation: '',
    officialEmail: '',
    logo: null,
    selectedPlan: '',

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

  plans = [
    { value: 'basic', label: 'Basic Plan - Free' },
    { value: 'professional', label: 'Professional Plan - $99/month' },
    { value: 'enterprise', label: 'Enterprise Plan - $299/month' },
    { value: 'premium', label: 'Premium Plan - $499/month' },
  ];

  grantTypes = [
    { value: 'implicit', label: 'Implicit Grant' },
    { value: 'authorization', label: 'Authorization Code Grant' },
  ];

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _productsService: ProductsService,
    private readonly _toastService: ToastService,
    private readonly _translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.providerId = parseInt(id, 10);
      // Load provider data if in edit mode (can be implemented later)
    }
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
        return !!(
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
          this.formData.selectedPlan
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
        if (!this.formData.selectedPlan) {
          errors.push('Plan selection is required');
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
      case 'selectedPlan':
        return !this.formData.selectedPlan;
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

    console.log('Provider registration submitted:', this.formData);

    const action = this.isEditMode ? 'updated' : 'registered';
    const title = this.isEditMode ? 'Provider Updated' : 'Provider Registered';
    const message = `"${this.formData.applicationName}" has been successfully ${action}.`;

    this._toastService.success(title, message);
    this._router.navigate(['/products']);
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

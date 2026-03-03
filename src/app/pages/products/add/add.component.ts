import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProductsService } from '../services/products.service';
import { ToastService } from '@shared/services/toast.service';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  stock: number | null;
  attributes: { [key: string]: string }; // e.g., { color: 'Red', size: 'L' }
}

interface ProductFormData {
  // Step 1: Basic Information
  name: string;
  category: string;
  description: string;
  status: string;

  // Step 2: Pricing & Stock
  price: number | null;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string;
  stock: number | null;
  lowStockThreshold: number | null;

  // Step 3: Images & Media
  imageUrl: string;
  galleryImages: string[];

  // Step 4: Variants
  variants: ProductVariant[];

  // Step 5: Additional Details
  tags: string;
  weight: number | null;
  dimensions: string;
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
  totalSteps = 5;
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;

  // Validation tracking
  attemptedNext = false;
  stepAttempted: { [key: number]: boolean } = {};

  // Variant management
  showVariantModal = false;
  editingVariant: ProductVariant | null = null;
  variantForm: ProductVariant = {
    id: '',
    name: '',
    sku: '',
    price: null,
    stock: null,
    attributes: {},
  };

  formData: ProductFormData = {
    name: '',
    category: '',
    description: '',
    status: 'draft',
    price: null,
    compareAtPrice: null,
    costPerItem: null,
    sku: '',
    stock: null,
    lowStockThreshold: 10,
    imageUrl: '',
    galleryImages: [],
    variants: [],
    tags: '',
    weight: null,
    dimensions: '',
  };

  categories = ['Electronics', 'Accessories', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty'];
  statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ];

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _productsService: ProductsService,
    private readonly _toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = parseInt(id, 10);
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this._productsService
      .getProductById(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (product) => {
          if (product) {
            this.formData = {
              name: product.name,
              category: product.category,
              description: product.description,
              status: product.status === 'in-stock' ? 'active' : 'draft',
              price: product.price,
              compareAtPrice: null,
              costPerItem: null,
              sku: `SKU-${product.id}`,
              stock: product.stock,
              lowStockThreshold: 10,
              imageUrl: product.image,
              galleryImages: [],
              variants: [],
              tags: '',
              weight: null,
              dimensions: '',
            };
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this._toastService.error('Load Failed', 'Failed to load product details.');
          this.isLoading = false;
          this._router.navigate(['/products']);
        },
      });
  }

  nextStep(): void {
    this.stepAttempted[this.currentStep] = true;

    if (!this.isStepValid(this.currentStep)) {
      const errors = this.getStepErrors(this.currentStep);
      this._toastService.warning('Validation Error', errors.join(', '));
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
        return !!(
          this.formData.name &&
          this.formData.name.trim().length >= 3 &&
          this.formData.category &&
          this.formData.description &&
          this.formData.description.trim().length >= 10
        );
      case 2:
        return !!(
          this.formData.price &&
          this.formData.price > 0 &&
          this.formData.sku &&
          this.formData.sku.trim().length >= 3 &&
          this.formData.stock !== null &&
          this.formData.stock >= 0 &&
          (!this.formData.compareAtPrice || this.formData.compareAtPrice > 0) &&
          (!this.formData.costPerItem || this.formData.costPerItem >= 0)
        );
      case 3:
        return !!(this.formData.imageUrl && this.isValidUrl(this.formData.imageUrl));
      case 4:
        // Variants are optional, but if any exist, validate them
        if (this.formData.variants.length > 0) {
          return this.formData.variants.every(
            (v) => v.name && v.sku && (v.price === null || v.price >= 0) && (v.stock === null || v.stock >= 0)
          );
        }
        return true;
      case 5:
        // Final step - all previous steps must be valid
        return this.isStepValid(1) && this.isStepValid(2) && this.isStepValid(3) && this.isStepValid(4);
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
        if (!this.formData.name || this.formData.name.trim().length < 3) {
          errors.push('Product name must be at least 3 characters');
        }
        if (!this.formData.category) {
          errors.push('Category is required');
        }
        if (!this.formData.description || this.formData.description.trim().length < 10) {
          errors.push('Description must be at least 10 characters');
        }
        break;

      case 2:
        if (!this.formData.price || this.formData.price <= 0) {
          errors.push('Price must be greater than 0');
        }
        if (!this.formData.sku || this.formData.sku.trim().length < 3) {
          errors.push('SKU must be at least 3 characters');
        }
        if (this.formData.stock === null || this.formData.stock < 0) {
          errors.push('Stock quantity must be 0 or greater');
        }
        if (this.formData.compareAtPrice && this.formData.compareAtPrice <= 0) {
          errors.push('Compare at price must be greater than 0');
        }
        if (this.formData.costPerItem && this.formData.costPerItem < 0) {
          errors.push('Cost per item cannot be negative');
        }
        break;

      case 3:
        if (!this.formData.imageUrl) {
          errors.push('Main product image is required');
        } else if (!this.isValidUrl(this.formData.imageUrl)) {
          errors.push('Please enter a valid image URL');
        }
        break;

      case 4:
        if (this.formData.variants.length > 0) {
          this.formData.variants.forEach((variant, index) => {
            if (!variant.name) {
              errors.push(`Variant ${index + 1}: Name is required`);
            }
            if (!variant.sku) {
              errors.push(`Variant ${index + 1}: SKU is required`);
            }
            if (variant.price !== null && variant.price < 0) {
              errors.push(`Variant ${index + 1}: Price cannot be negative`);
            }
            if (variant.stock !== null && variant.stock < 0) {
              errors.push(`Variant ${index + 1}: Stock cannot be negative`);
            }
          });
        }
        break;

      case 5:
        // Aggregate errors from all previous steps
        if (!this.isStepValid(1)) {
          errors.push('Basic information is incomplete');
        }
        if (!this.isStepValid(2)) {
          errors.push('Pricing & stock information is incomplete');
        }
        if (!this.isStepValid(3)) {
          errors.push('Product image is required');
        }
        if (!this.isStepValid(4)) {
          errors.push('Some variants have validation errors');
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

  hasFieldError(field: string): boolean {
    const currentStepAttempted = this.stepAttempted[this.currentStep];
    if (!currentStepAttempted) return false;

    switch (field) {
      case 'name':
        return !this.formData.name || this.formData.name.trim().length < 3;
      case 'category':
        return !this.formData.category;
      case 'description':
        return !this.formData.description || this.formData.description.trim().length < 10;
      case 'price':
        return !this.formData.price || this.formData.price <= 0;
      case 'sku':
        return !this.formData.sku || this.formData.sku.trim().length < 3;
      case 'stock':
        return this.formData.stock === null || this.formData.stock < 0;
      case 'imageUrl':
        return !this.formData.imageUrl || !this.isValidUrl(this.formData.imageUrl);
      default:
        return false;
    }
  }

  addGalleryImage(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      this.formData.galleryImages.push(url);
    }
  }

  removeGalleryImage(index: number): void {
    this.formData.galleryImages.splice(index, 1);
  }

  submitProduct(): void {
    // Mark all steps as attempted to show validation errors
    this.stepAttempted[1] = true;
    this.stepAttempted[2] = true;
    this.stepAttempted[3] = true;
    this.stepAttempted[4] = true;
    this.stepAttempted[5] = true;

    // Validate all steps
    if (!this.isStepValid(5)) {
      const errors = this.getStepErrors(5);
      this._toastService.error('Validation Failed', 'Please fix all validation errors before submitting. ' + errors.join('; '));

      // Navigate to the first invalid step
      for (let step = 1; step <= 4; step++) {
        if (!this.isStepValid(step)) {
          this.currentStep = step;
          window.scrollTo(0, 0);
          break;
        }
      }
      return;
    }

    console.log('Product submitted:', this.formData);

    const action = this.isEditMode ? 'updated' : 'created';
    const title = this.isEditMode ? 'Product Updated' : 'Product Created';
    const message = `"${this.formData.name}" has been successfully ${action}.`;

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
        return 'Basic Information';
      case 2:
        return 'Pricing & Stock';
      case 3:
        return 'Images & Media';
      case 4:
        return 'Product Variants';
      case 5:
        return 'Review & Submit';
      default:
        return '';
    }
  }

  getStepIcon(step: number): string {
    switch (step) {
      case 1:
        return 'ti-file-text';
      case 2:
        return 'ti-currency-dollar';
      case 3:
        return 'ti-photo';
      case 4:
        return 'ti-versions';
      case 5:
        return 'ti-check';
      default:
        return 'ti-circle';
    }
  }

  // Variant Management Methods
  openAddVariantModal(): void {
    this.editingVariant = null;
    this.variantForm = {
      id: this.generateVariantId(),
      name: '',
      sku: '',
      price: this.formData.price,
      stock: null,
      attributes: {},
    };
    this.showVariantModal = true;
  }

  openEditVariantModal(variant: ProductVariant): void {
    this.editingVariant = variant;
    this.variantForm = { ...variant, attributes: { ...variant.attributes } };
    this.showVariantModal = true;
  }

  closeVariantModal(): void {
    this.showVariantModal = false;
    this.editingVariant = null;
  }

  saveVariant(): void {
    if (!this.variantForm.name || !this.variantForm.sku) {
      this._toastService.warning('Invalid Variant', 'Please provide variant name and SKU.');
      return;
    }

    if (this.editingVariant) {
      // Update existing variant
      const index = this.formData.variants.findIndex((v) => v.id === this.editingVariant!.id);
      if (index !== -1) {
        this.formData.variants[index] = { ...this.variantForm };
        this._toastService.success('Variant Updated', 'Product variant has been updated.');
      }
    } else {
      // Add new variant
      this.formData.variants.push({ ...this.variantForm });
      this._toastService.success('Variant Added', 'Product variant has been added.');
    }

    this.closeVariantModal();
  }

  deleteVariant(variant: ProductVariant): void {
    const confirmed = confirm(`Are you sure you want to delete variant "${variant.name}"?`);
    if (confirmed) {
      this.formData.variants = this.formData.variants.filter((v) => v.id !== variant.id);
      this._toastService.success('Variant Deleted', 'Product variant has been deleted.');
    }
  }

  addAttribute(key: string, value: string): void {
    if (key && value) {
      this.variantForm.attributes[key] = value;
    }
  }

  removeAttribute(key: string): void {
    delete this.variantForm.attributes[key];
  }

  getAttributeKeys(): string[] {
    return Object.keys(this.variantForm.attributes);
  }

  getVariantAttributeKeys(variant: ProductVariant): string[] {
    return Object.keys(variant.attributes);
  }

  private generateVariantId(): string {
    return `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}

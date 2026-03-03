import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

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

  // Step 4: Additional Details
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
  totalSteps = 4;

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

  constructor(private readonly _router: Router) {}

  ngOnInit(): void {}

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
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
        return !!(this.formData.name && this.formData.category && this.formData.description);
      case 2:
        return !!(this.formData.price && this.formData.sku && this.formData.stock !== null);
      case 3:
        return !!this.formData.imageUrl;
      case 4:
        return true;
      default:
        return false;
    }
  }

  canProceed(): boolean {
    return this.isStepValid(this.currentStep);
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
    if (this.isStepValid(1) && this.isStepValid(2) && this.isStepValid(3)) {
      console.log('Product submitted:', this.formData);
      alert('Product created successfully!');
      this._router.navigate(['/products']);
    } else {
      alert('Please complete all required fields');
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
        return 'Basic Information';
      case 2:
        return 'Pricing & Stock';
      case 3:
        return 'Images & Media';
      case 4:
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
        return 'ti-check';
      default:
        return 'ti-circle';
    }
  }

  getProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}

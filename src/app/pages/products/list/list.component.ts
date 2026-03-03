import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProductsService } from '../services/products.service';
import { Product } from '../entities';
import { ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery = '';
  isLoading = false;
  isSearching = false;
  hasError = false;
  errorMessage = '';

  // Tab navigation
  activeTab: 'all' | 'favorites' | 'deprecated' = 'all';

  // View product modal
  selectedProduct: Product | null = null;
  showViewModal = false;

  // Delete confirmation modal
  productToDelete: Product | null = null;
  showDeleteModal = false;

  // Skeleton loader placeholders
  skeletonArray = Array(8).fill(0);

  constructor(
    private readonly _productsService: ProductsService,
    private readonly _toastService: ToastService,
    private readonly _router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;
    this._productsService
      .getProducts()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = 'Failed to load products. Please try again later.';
        },
      });
  }

  retryLoading(): void {
    this.loadProducts();
  }

  switchTab(tab: 'all' | 'favorites' | 'deprecated'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Filter by tab
    switch (this.activeTab) {
      case 'favorites':
        filtered = filtered.filter((p) => p.isFavorite);
        break;
      case 'deprecated':
        filtered = filtered.filter((p) => p.deprecated);
        break;
      case 'all':
      default:
        // Show all products
        break;
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      );
    }

    this.filteredProducts = filtered;
  }

  searchProducts(): void {
    // Use local filtering for instant search
    this.applyFilters();
  }

  toggleFavorite(product: Product): void {
    this._productsService
      .toggleFavorite(product.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (success) => {
          if (success) {
            product.isFavorite = !product.isFavorite;
          }
        },
        error: (error) => {
          console.error('Error toggling favorite:', error);
        },
      });
  }

  viewProduct(product: Product): void {
    this.selectedProduct = product;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedProduct = null;
  }

  editProduct(product: Product): void {
    this._router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    const productName = this.productToDelete.name;
    this._productsService
      .deleteProduct(this.productToDelete.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (success) => {
          if (success) {
            this.products = this.products.filter((p) => p.id !== this.productToDelete!.id);
            this.applyFilters();
            this._toastService.success('Product Deleted', `"${productName}" has been successfully deleted.`);
            this.closeDeleteModal();
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this._toastService.error('Delete Failed', 'Failed to delete product. Please try again.');
          this.closeDeleteModal();
        },
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  getTabCount(tab: 'all' | 'favorites' | 'deprecated'): number {
    switch (tab) {
      case 'all':
        return this.products.length;
      case 'favorites':
        return this.products.filter((p) => p.isFavorite).length;
      case 'deprecated':
        return this.products.filter((p) => p.deprecated).length;
      default:
        return 0;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'in-stock':
        return 'bg-success';
      case 'low-stock':
        return 'bg-warning';
      case 'out-of-stock':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}

import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Product, ProductsService } from '../services/products.service';

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

  // Skeleton loader placeholders
  skeletonArray = Array(8).fill(0);

  constructor(private readonly _productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this._productsService
      .getProducts()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = [...products];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
        },
      });
  }

  searchProducts(): void {
    this.isSearching = true;
    this._productsService
      .searchProducts(this.searchQuery)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (products) => {
          this.filteredProducts = products;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error searching products:', error);
          this.isSearching = false;
        },
      });
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
    console.log('View product:', product);
    // Implement view logic
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
    // Implement edit logic
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Are you sure you want to delete "${product.name}"?`);
    if (confirmed) {
      this._productsService
        .deleteProduct(product.id)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (success) => {
            if (success) {
              this.products = this.products.filter((p) => p.id !== product.id);
              this.filteredProducts = this.filteredProducts.filter((p) => p.id !== product.id);
              console.log('Product deleted:', product);
            }
          },
          error: (error) => {
            console.error('Error deleting product:', error);
          },
        });
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

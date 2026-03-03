import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  image: string;
  isFavorite: boolean;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 299.99,
      category: 'Electronics',
      stock: 45,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      description: 'Advanced fitness tracker with heart rate monitor, GPS, and water resistance.',
      price: 399.99,
      category: 'Electronics',
      stock: 12,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      isFavorite: true,
      status: 'low-stock',
    },
    {
      id: 3,
      name: 'Portable Bluetooth Speaker',
      description: 'Compact and powerful speaker with 360-degree sound and 12-hour battery.',
      price: 89.99,
      category: 'Electronics',
      stock: 78,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
    {
      id: 4,
      name: 'USB-C Hub Adapter',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery.',
      price: 49.99,
      category: 'Accessories',
      stock: 0,
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'out-of-stock',
    },
    {
      id: 5,
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with Cherry MX switches and programmable keys.',
      price: 149.99,
      category: 'Accessories',
      stock: 32,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      isFavorite: true,
      status: 'in-stock',
    },
    {
      id: 6,
      name: 'Ergonomic Mouse',
      description: 'Vertical ergonomic mouse with adjustable DPI and wireless connectivity.',
      price: 59.99,
      category: 'Accessories',
      stock: 56,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
    {
      id: 7,
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand with heat dissipation design.',
      price: 39.99,
      category: 'Accessories',
      stock: 89,
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
    {
      id: 8,
      name: 'Webcam HD 1080p',
      description: 'Full HD webcam with auto-focus, noise reduction, and built-in microphone.',
      price: 79.99,
      category: 'Electronics',
      stock: 8,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1593640495390-c1c3dfe84c78?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'low-stock',
    },
    {
      id: 9,
      name: 'Wireless Gaming Mouse',
      description: 'High-precision wireless gaming mouse with RGB lighting and 20,000 DPI sensor.',
      price: 79.99,
      category: 'Accessories',
      stock: 25,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
    {
      id: 10,
      name: '4K Monitor 27"',
      description: 'Ultra HD 4K monitor with HDR support, 144Hz refresh rate, and USB-C connectivity.',
      price: 549.99,
      category: 'Electronics',
      stock: 18,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
      isFavorite: true,
      status: 'in-stock',
    },
    {
      id: 11,
      name: 'Desk Organizer Set',
      description: 'Premium desk organizer with pen holder, document tray, and cable management.',
      price: 34.99,
      category: 'Accessories',
      stock: 67,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
    {
      id: 12,
      name: 'LED Desk Lamp',
      description: 'Adjustable LED desk lamp with touch control, USB charging port, and eye-care mode.',
      price: 45.99,
      category: 'Accessories',
      stock: 41,
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
    },
  ];

  constructor() {}

  /**
   * Mock API call to get all products with a delay of 3-5 seconds
   */
  getProducts(): Observable<Product[]> {
    const delayTime = Math.floor(Math.random() * 2000) + 3000; // Random delay between 3-5 seconds
    return of([...this.mockProducts]).pipe(delay(delayTime));
  }

  /**
   * Mock API call to get a single product by ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    const delayTime = Math.floor(Math.random() * 2000) + 3000;
    const product = this.mockProducts.find((p) => p.id === id);
    return of(product).pipe(delay(delayTime));
  }

  /**
   * Mock API call to search products
   */
  searchProducts(query: string): Observable<Product[]> {
    const delayTime = Math.floor(Math.random() * 2000) + 3000;
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return of([...this.mockProducts]).pipe(delay(delayTime));
    }

    const filtered = this.mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery),
    );

    return of(filtered).pipe(delay(delayTime));
  }

  /**
   * Mock API call to toggle favorite status
   */
  toggleFavorite(productId: number): Observable<boolean> {
    const product = this.mockProducts.find((p) => p.id === productId);
    if (product) {
      product.isFavorite = !product.isFavorite;
      return of(true).pipe(delay(500)); // Quick action
    }
    return of(false).pipe(delay(500));
  }

  /**
   * Mock API call to delete a product
   */
  deleteProduct(productId: number): Observable<boolean> {
    const index = this.mockProducts.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }
}

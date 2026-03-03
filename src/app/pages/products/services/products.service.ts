import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, timeout, catchError, throwError, map } from 'rxjs';
import { environment } from '@env/environment';
import { Product, ProductApiDto, ApiResponse } from '../entities';
import { ProductMapper } from '../mappers';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly useMockData = environment.useMockData;
  private readonly useApiMapper = environment.useApiMapper;
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiTimeout = environment.apiTimeout;
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
      deprecated: false,
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
      deprecated: false,
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
      deprecated: false,
    },
    {
      id: 4,
      name: 'USB-C Hub Adapter (Old Model)',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery.',
      price: 49.99,
      category: 'Accessories',
      stock: 0,
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'out-of-stock',
      deprecated: true,
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
      deprecated: false,
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
      deprecated: false,
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
      deprecated: false,
    },
    {
      id: 8,
      name: 'Webcam HD 1080p (Discontinued)',
      description: 'Full HD webcam with auto-focus, noise reduction, and built-in microphone.',
      price: 79.99,
      category: 'Electronics',
      stock: 8,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1593640495390-c1c3dfe84c78?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'low-stock',
      deprecated: true,
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
      deprecated: false,
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
      deprecated: false,
    },
    {
      id: 11,
      name: 'Desk Organizer Set (Legacy)',
      description: 'Premium desk organizer with pen holder, document tray, and cable management.',
      price: 34.99,
      category: 'Accessories',
      stock: 67,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
      isFavorite: false,
      status: 'in-stock',
      deprecated: true,
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
      deprecated: false,
    },
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly productMapper: ProductMapper,
  ) {}

  /**
   * Helper method to build full API URL
   */
  private buildUrl(endpoint: string, params?: { [key: string]: string | number }): string {
    let url = `${this.apiBaseUrl}${endpoint}`;

    // Replace URL parameters (e.g., :id)
    if (params) {
      Object.keys(params).forEach((key) => {
        url = url.replace(`:${key}`, String(params[key]));
      });
    }

    return url;
  }

  /**
   * Helper method to get random delay time for mock data
   */
  private getRandomDelay(): number {
    const min = environment.mockDataDelay.min;
    const max = environment.mockDataDelay.max;
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Get all products (supports both mock and API modes)
   * Automatically maps API response to Product entities if useApiMapper is enabled
   */
  getProducts(): Observable<Product[]> {
    if (this.useMockData) {
      return this.getMockProducts();
    }

    const url = this.buildUrl(environment.apiEndpoints.products.getAll);

    // If API returns DTOs, map them to Product entities
    if (this.useApiMapper) {
      return this.http.get<ProductApiDto[]>(url).pipe(
        map((dtos) => this.productMapper.fromDtoArray(dtos)),
        timeout(this.apiTimeout),
        catchError((error) => {
          console.error('Error fetching products from API:', error);
          return throwError(() => error);
        })
      );
    }

    // If API already returns correct format, use directly
    return this.http.get<Product[]>(url).pipe(
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error('Error fetching products from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of getProducts
   */
  private getMockProducts(): Observable<Product[]> {
    return of([...this.mockProducts]).pipe(delay(this.getRandomDelay()));
  }

  /**
   * Get a single product by ID (supports both mock and API modes)
   * Automatically maps API response to Product entity if useApiMapper is enabled
   */
  getProductById(id: number): Observable<Product | undefined> {
    if (this.useMockData) {
      return this.getMockProductById(id);
    }

    const url = this.buildUrl(environment.apiEndpoints.products.getById, { id });

    // If API returns DTOs, map them to Product entities
    if (this.useApiMapper) {
      return this.http.get<ProductApiDto>(url).pipe(
        map((dto) => this.productMapper.fromDto(dto)),
        timeout(this.apiTimeout),
        catchError((error) => {
          console.error(`Error fetching product ${id} from API:`, error);
          return throwError(() => error);
        })
      );
    }

    // If API already returns correct format, use directly
    return this.http.get<Product>(url).pipe(
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error(`Error fetching product ${id} from API:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of getProductById
   */
  private getMockProductById(id: number): Observable<Product | undefined> {
    const product = this.mockProducts.find((p) => p.id === id);
    return of(product).pipe(delay(this.getRandomDelay()));
  }

  /**
   * Search products by query (supports both mock and API modes)
   * Automatically maps API response to Product entities if useApiMapper is enabled
   */
  searchProducts(query: string): Observable<Product[]> {
    if (this.useMockData) {
      return this.mockSearchProducts(query);
    }

    const url = this.buildUrl(environment.apiEndpoints.products.search);
    const params = new HttpParams().set('q', query);

    // If API returns DTOs, map them to Product entities
    if (this.useApiMapper) {
      return this.http.get<ProductApiDto[]>(url, { params }).pipe(
        map((dtos) => this.productMapper.fromDtoArray(dtos)),
        timeout(this.apiTimeout),
        catchError((error) => {
          console.error('Error searching products from API:', error);
          return throwError(() => error);
        })
      );
    }

    // If API already returns correct format, use directly
    return this.http.get<Product[]>(url, { params }).pipe(
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error('Error searching products from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of searchProducts
   */
  private mockSearchProducts(query: string): Observable<Product[]> {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return of([...this.mockProducts]).pipe(delay(this.getRandomDelay()));
    }

    const filtered = this.mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );

    return of(filtered).pipe(delay(this.getRandomDelay()));
  }

  /**
   * Toggle favorite status of a product (supports both mock and API modes)
   */
  toggleFavorite(productId: number): Observable<boolean> {
    if (this.useMockData) {
      return this.mockToggleFavorite(productId);
    }

    const url = this.buildUrl(environment.apiEndpoints.products.toggleFavorite, { id: productId });
    return this.http.patch<{ success: boolean }>(url, {}).pipe(
      map((response) => response.success),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error(`Error toggling favorite for product ${productId}:`, error);
        return throwError(() => error);
      }),
      delay(500) // Quick action
    );
  }

  /**
   * Mock implementation of toggleFavorite
   */
  private mockToggleFavorite(productId: number): Observable<boolean> {
    const product = this.mockProducts.find((p) => p.id === productId);
    if (product) {
      product.isFavorite = !product.isFavorite;
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  /**
   * Delete a product by ID (supports both mock and API modes)
   */
  deleteProduct(productId: number): Observable<boolean> {
    if (this.useMockData) {
      return this.mockDeleteProduct(productId);
    }

    const url = this.buildUrl(environment.apiEndpoints.products.delete, { id: productId });
    return this.http.delete<{ success: boolean }>(url).pipe(
      map((response) => response.success),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error(`Error deleting product ${productId}:`, error);
        return throwError(() => error);
      }),
      delay(1000)
    );
  }

  /**
   * Mock implementation of deleteProduct
   */
  private mockDeleteProduct(productId: number): Observable<boolean> {
    const index = this.mockProducts.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  /**
   * Create a new product (supports both mock and API modes)
   * Automatically serializes Product entity to API DTO if useApiMapper is enabled
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    if (this.useMockData) {
      return this.mockCreateProduct(product);
    }

    const url = this.buildUrl(environment.apiEndpoints.products.create);

    // If API expects DTOs, serialize Product entity to DTO
    if (this.useApiMapper) {
      const dto = this.productMapper.toCreateDto(product);
      return this.http.post<ProductApiDto>(url, dto).pipe(
        map((responseDto) => this.productMapper.fromDto(responseDto)),
        timeout(this.apiTimeout),
        catchError((error) => {
          console.error('Error creating product:', error);
          return throwError(() => error);
        })
      );
    }

    // If API already expects correct format, use directly
    return this.http.post<Product>(url, product).pipe(
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error('Error creating product:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of createProduct
   */
  private mockCreateProduct(product: Partial<Product>): Observable<Product> {
    const newId = Math.max(...this.mockProducts.map((p) => p.id)) + 1;
    const newProduct: Product = {
      id: newId,
      name: product.name || 'New Product',
      description: product.description || '',
      category: product.category || 'Uncategorized',
      price: product.price || 0,
      stock: product.stock || 0,
      rating: product.rating || 0,
      image: product.image || '',
      isFavorite: product.isFavorite || false,
      status: product.status || 'in-stock',
      deprecated: product.deprecated || false,
    };

    this.mockProducts.push(newProduct);
    return of(newProduct).pipe(delay(this.getRandomDelay()));
  }

  /**
   * Update an existing product (supports both mock and API modes)
   * Automatically serializes Product entity to API DTO if useApiMapper is enabled
   */
  updateProduct(productId: number, updates: Partial<Product>): Observable<Product> {
    if (this.useMockData) {
      return this.mockUpdateProduct(productId, updates);
    }

    const url = this.buildUrl(environment.apiEndpoints.products.update, { id: productId });

    // If API expects DTOs, serialize Product updates to DTO
    if (this.useApiMapper) {
      const dto = this.productMapper.toUpdateDto(updates);
      return this.http.put<ProductApiDto>(url, dto).pipe(
        map((responseDto) => this.productMapper.fromDto(responseDto)),
        timeout(this.apiTimeout),
        catchError((error) => {
          console.error(`Error updating product ${productId}:`, error);
          return throwError(() => error);
        })
      );
    }

    // If API already expects correct format, use directly
    return this.http.put<Product>(url, updates).pipe(
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error(`Error updating product ${productId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of updateProduct
   */
  private mockUpdateProduct(productId: number, updates: Partial<Product>): Observable<Product> {
    const product = this.mockProducts.find((p) => p.id === productId);
    if (!product) {
      return throwError(() => new Error(`Product with ID ${productId} not found`));
    }

    Object.assign(product, updates);
    return of(product).pipe(delay(this.getRandomDelay()));
  }
}

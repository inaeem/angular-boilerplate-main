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

  /**
   * Mock data in API DTO format (snake_case)
   * This ensures mapper is exercised even with mock data when useApiMapper: true
   */
  private mockProductDtos: ProductApiDto[] = [
    {
      id: 1,
      product_name: 'Premium Wireless Headphones',
      product_description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      unit_price: 299.99,
      product_category: 'Electronics',
      stock_quantity: 45,
      rating_score: 4.5,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 2,
      product_name: 'Smart Watch Pro',
      product_description: 'Advanced fitness tracker with heart rate monitor, GPS, and water resistance.',
      unit_price: 399.99,
      product_category: 'Electronics',
      stock_quantity: 12,
      rating_score: 4.8,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      is_favorite: true,
      product_status: 'LOW_STOCK',
      is_deprecated: false,
    },
    {
      id: 3,
      product_name: 'Portable Bluetooth Speaker',
      product_description: 'Compact and powerful speaker with 360-degree sound and 12-hour battery.',
      unit_price: 89.99,
      product_category: 'Electronics',
      stock_quantity: 78,
      rating_score: 4.3,
      image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 4,
      product_name: 'USB-C Hub Adapter (Old Model)',
      product_description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery.',
      unit_price: 49.99,
      product_category: 'Accessories',
      stock_quantity: 0,
      rating_score: 4.1,
      image_url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'OUT_OF_STOCK',
      is_deprecated: true,
    },
    {
      id: 5,
      product_name: 'Mechanical Keyboard',
      product_description: 'RGB backlit mechanical keyboard with Cherry MX switches and programmable keys.',
      unit_price: 149.99,
      product_category: 'Accessories',
      stock_quantity: 32,
      rating_score: 4.7,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      is_favorite: true,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 6,
      product_name: 'Ergonomic Mouse',
      product_description: 'Vertical ergonomic mouse with adjustable DPI and wireless connectivity.',
      unit_price: 59.99,
      product_category: 'Accessories',
      stock_quantity: 56,
      rating_score: 4.4,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 7,
      product_name: 'Laptop Stand',
      product_description: 'Adjustable aluminum laptop stand with heat dissipation design.',
      unit_price: 39.99,
      product_category: 'Accessories',
      stock_quantity: 89,
      rating_score: 4.2,
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 8,
      product_name: 'Webcam HD 1080p (Discontinued)',
      product_description: 'Full HD webcam with auto-focus, noise reduction, and built-in microphone.',
      unit_price: 79.99,
      product_category: 'Electronics',
      stock_quantity: 8,
      rating_score: 4.6,
      image_url: 'https://images.unsplash.com/photo-1593640495390-c1c3dfe84c78?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'LOW_STOCK',
      is_deprecated: true,
    },
    {
      id: 9,
      product_name: 'Wireless Gaming Mouse',
      product_description: 'High-precision wireless gaming mouse with RGB lighting and 20,000 DPI sensor.',
      unit_price: 79.99,
      product_category: 'Accessories',
      stock_quantity: 25,
      rating_score: 4.6,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 10,
      product_name: '4K Monitor 27"',
      product_description: 'Ultra HD 4K monitor with HDR support, 144Hz refresh rate, and USB-C connectivity.',
      unit_price: 549.99,
      product_category: 'Electronics',
      stock_quantity: 18,
      rating_score: 4.9,
      image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
      is_favorite: true,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
    {
      id: 11,
      product_name: 'Desk Organizer Set (Legacy)',
      product_description: 'Premium desk organizer with pen holder, document tray, and cable management.',
      unit_price: 34.99,
      product_category: 'Accessories',
      stock_quantity: 67,
      rating_score: 4.3,
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: true,
    },
    {
      id: 12,
      product_name: 'LED Desk Lamp',
      product_description: 'Adjustable LED desk lamp with touch control, USB charging port, and eye-care mode.',
      unit_price: 45.99,
      product_category: 'Accessories',
      stock_quantity: 41,
      rating_score: 4.4,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      is_favorite: false,
      product_status: 'IN_STOCK',
      is_deprecated: false,
    },
  ];

  /**
   * Mock data in Product entity format (camelCase)
   * Used when useApiMapper: false (mock data already in correct format)
   */
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
   * Real API ALWAYS returns DTOs which are mapped to Product entities
   */
  getProducts(): Observable<Product[]> {
    if (this.useMockData) {
      return this.getMockProducts();
    }

    // Real API ALWAYS returns DTOs, so ALWAYS map them to Product entities
    const url = this.buildUrl(environment.apiEndpoints.products.getAll);
    return this.http.get<ProductApiDto[]>(url).pipe(
      map((dtos) => this.productMapper.fromDtoArray(dtos)),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error('Error fetching products from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of getProducts
   * Returns DTOs when useApiMapper is true to ensure mapper is exercised
   */
  private getMockProducts(): Observable<Product[]> {
    if (this.useApiMapper) {
      // Return DTOs and let the mapper transform them (same as real API)
      const dtos = [...this.mockProductDtos];
      return of(dtos).pipe(
        map((dtos) => this.productMapper.fromDtoArray(dtos)),
        delay(this.getRandomDelay())
      );
    }

    // Return Product entities directly (no mapping needed)
    return of([...this.mockProducts]).pipe(delay(this.getRandomDelay()));
  }

  /**
   * Get a single product by ID (supports both mock and API modes)
   * Real API ALWAYS returns DTOs which are mapped to Product entities
   */
  getProductById(id: number): Observable<Product | undefined> {
    if (this.useMockData) {
      return this.getMockProductById(id);
    }

    // Real API ALWAYS returns DTOs, so ALWAYS map them to Product entities
    const url = this.buildUrl(environment.apiEndpoints.products.getById, { id });
    return this.http.get<ProductApiDto>(url).pipe(
      map((dto) => this.productMapper.fromDto(dto)),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error(`Error fetching product ${id} from API:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of getProductById
   * Returns DTOs when useApiMapper is true to ensure mapper is exercised
   */
  private getMockProductById(id: number): Observable<Product | undefined> {
    if (this.useApiMapper) {
      // Return DTO and let the mapper transform it (same as real API)
      const dto = this.mockProductDtos.find((p) => p.id === id);
      if (!dto) {
        return of(undefined).pipe(delay(this.getRandomDelay()));
      }
      return of(dto).pipe(
        map((dto) => this.productMapper.fromDto(dto)),
        delay(this.getRandomDelay())
      );
    }

    // Return Product entity directly (no mapping needed)
    const product = this.mockProducts.find((p) => p.id === id);
    return of(product).pipe(delay(this.getRandomDelay()));
  }

  /**
   * Search products by query (supports both mock and API modes)
   * Real API ALWAYS returns DTOs which are mapped to Product entities
   */
  searchProducts(query: string): Observable<Product[]> {
    if (this.useMockData) {
      return this.mockSearchProducts(query);
    }

    // Real API ALWAYS returns DTOs, so ALWAYS map them to Product entities
    const url = this.buildUrl(environment.apiEndpoints.products.search);
    const params = new HttpParams().set('q', query);
    return this.http.get<ProductApiDto[]>(url, { params }).pipe(
      map((dtos) => this.productMapper.fromDtoArray(dtos)),
      timeout(this.apiTimeout),
      catchError((error) => {
        console.error('Error searching products from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock implementation of searchProducts
   * Returns DTOs when useApiMapper is true to ensure mapper is exercised
   */
  private mockSearchProducts(query: string): Observable<Product[]> {
    const lowerQuery = query.toLowerCase().trim();

    if (this.useApiMapper) {
      // Filter DTOs and let the mapper transform them (same as real API)
      if (!lowerQuery) {
        return of([...this.mockProductDtos]).pipe(
          map((dtos) => this.productMapper.fromDtoArray(dtos)),
          delay(this.getRandomDelay())
        );
      }

      const filtered = this.mockProductDtos.filter(
        (dto) =>
          dto.product_name.toLowerCase().includes(lowerQuery) ||
          dto.product_description.toLowerCase().includes(lowerQuery) ||
          dto.product_category.toLowerCase().includes(lowerQuery)
      );

      return of(filtered).pipe(
        map((dtos) => this.productMapper.fromDtoArray(dtos)),
        delay(this.getRandomDelay())
      );
    }

    // Return Product entities directly (no mapping needed)
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
   * Modifies the correct data source based on useApiMapper setting
   */
  private mockToggleFavorite(productId: number): Observable<boolean> {
    if (this.useApiMapper) {
      // Modify DTO data source
      const dto = this.mockProductDtos.find((p) => p.id === productId);
      if (dto) {
        dto.is_favorite = !dto.is_favorite;
        return of(true).pipe(delay(500));
      }
      return of(false).pipe(delay(500));
    }

    // Modify Product entity data source
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
   * Modifies the correct data source based on useApiMapper setting
   */
  private mockDeleteProduct(productId: number): Observable<boolean> {
    if (this.useApiMapper) {
      // Delete from DTO data source
      const index = this.mockProductDtos.findIndex((p) => p.id === productId);
      if (index !== -1) {
        this.mockProductDtos.splice(index, 1);
        return of(true).pipe(delay(1000));
      }
      return of(false).pipe(delay(1000));
    }

    // Delete from Product entity data source
    const index = this.mockProducts.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  /**
   * Create a new product (supports both mock and API modes)
   * Real API ALWAYS expects DTOs and returns DTOs
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    if (this.useMockData) {
      return this.mockCreateProduct(product);
    }

    // Real API ALWAYS expects DTOs
    // Serialize Product entity to DTO, send to API, then map response back to entity
    const url = this.buildUrl(environment.apiEndpoints.products.create);
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

  /**
   * Mock implementation of createProduct
   * Creates in DTO format when useApiMapper is true, then transforms to entity
   */
  private mockCreateProduct(product: Partial<Product>): Observable<Product> {
    if (this.useApiMapper) {
      // Create as DTO (simulate API behavior)
      const newId = Math.max(...this.mockProductDtos.map((p) => p.id)) + 1;
      const newDto: ProductApiDto = {
        id: newId,
        product_name: product.name || 'New Product',
        product_description: product.description || '',
        product_category: product.category || 'Uncategorized',
        unit_price: product.price || 0,
        stock_quantity: product.stock || 0,
        rating_score: product.rating || 0,
        image_url: product.image || '',
        is_favorite: product.isFavorite || false,
        product_status: product.status === 'in-stock' ? 'IN_STOCK' : 'DRAFT',
        is_deprecated: product.deprecated || false,
      };

      this.mockProductDtos.push(newDto);

      // Return as mapped entity (same as real API)
      return of(newDto).pipe(
        map((dto) => this.productMapper.fromDto(dto)),
        delay(this.getRandomDelay())
      );
    }

    // Create as Product entity directly
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
   * Real API ALWAYS expects DTOs and returns DTOs
   */
  updateProduct(productId: number, updates: Partial<Product>): Observable<Product> {
    if (this.useMockData) {
      return this.mockUpdateProduct(productId, updates);
    }

    // Real API ALWAYS expects DTOs
    // Serialize Product updates to DTO, send to API, then map response back to entity
    const url = this.buildUrl(environment.apiEndpoints.products.update, { id: productId });
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

  /**
   * Mock implementation of updateProduct
   * Updates DTO format when useApiMapper is true, then transforms to entity
   */
  private mockUpdateProduct(productId: number, updates: Partial<Product>): Observable<Product> {
    if (this.useApiMapper) {
      // Update DTO (simulate API behavior)
      const dto = this.mockProductDtos.find((p) => p.id === productId);
      if (!dto) {
        return throwError(() => new Error(`Product with ID ${productId} not found`));
      }

      // Apply updates to DTO fields
      if (updates.name !== undefined) dto.product_name = updates.name;
      if (updates.description !== undefined) dto.product_description = updates.description;
      if (updates.category !== undefined) dto.product_category = updates.category;
      if (updates.price !== undefined) dto.unit_price = updates.price;
      if (updates.stock !== undefined) dto.stock_quantity = updates.stock;
      if (updates.rating !== undefined) dto.rating_score = updates.rating;
      if (updates.image !== undefined) dto.image_url = updates.image;
      if (updates.isFavorite !== undefined) dto.is_favorite = updates.isFavorite;
      if (updates.deprecated !== undefined) dto.is_deprecated = updates.deprecated;
      if (updates.status !== undefined) {
        dto.product_status = updates.status === 'in-stock' ? 'IN_STOCK' : updates.status === 'low-stock' ? 'LOW_STOCK' : 'OUT_OF_STOCK';
      }

      // Return as mapped entity (same as real API)
      return of(dto).pipe(
        map((dto) => this.productMapper.fromDto(dto)),
        delay(this.getRandomDelay())
      );
    }

    // Update Product entity directly
    const product = this.mockProducts.find((p) => p.id === productId);
    if (!product) {
      return throwError(() => new Error(`Product with ID ${productId} not found`));
    }

    Object.assign(product, updates);
    return of(product).pipe(delay(this.getRandomDelay()));
  }
}

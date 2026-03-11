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
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiTimeout = environment.apiTimeout;

  /**
   * Mock data in API DTO format (snake_case)
   * Mock data ALWAYS uses DTO format to simulate real API behavior
   */
  private mockProductDtos: ProductApiDto[] = [
    {
      id: 1,
      product_name: 'Premium Wireless Headphones',
      product_description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      product_category: 'Electronics',
      product_status: 'IN_STOCK',
      unit_price: 299.99,
      compare_at_price: 349.99,
      cost_per_item: 150.00,
      product_sku: 'WH-PRE-001',
      stock_quantity: 45,
      low_stock_threshold: 10,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      gallery_images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop',
      ],
      product_variants: [
        {
          id: 'var-1-1',
          variant_name: 'Black - Standard',
          variant_sku: 'WH-PRE-001-BLK',
          variant_price: 299.99,
          variant_stock: 25,
          variant_attributes: { color: 'Black', size: 'Standard' },
        },
        {
          id: 'var-1-2',
          variant_name: 'Silver - Standard',
          variant_sku: 'WH-PRE-001-SLV',
          variant_price: 299.99,
          variant_stock: 20,
          variant_attributes: { color: 'Silver', size: 'Standard' },
        },
      ],
      product_tags: 'audio, wireless, headphones, premium',
      product_weight: 250,
      product_dimensions: '19 x 17 x 8 cm',
      rating_score: 4.5,
      is_favorite: false,
      is_deprecated: false,
    },
    {
      id: 2,
      product_name: 'Smart Watch Pro',
      product_description: 'Advanced fitness tracker with heart rate monitor, GPS, and water resistance.',
      product_category: 'Electronics',
      product_status: 'LOW_STOCK',
      unit_price: 399.99,
      compare_at_price: null,
      cost_per_item: 200.00,
      product_sku: 'SW-PRO-002',
      stock_quantity: 12,
      low_stock_threshold: 15,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      product_tags: 'smartwatch, fitness, wearable',
      product_weight: 45,
      product_dimensions: '4 x 4 x 1 cm',
      rating_score: 4.8,
      is_favorite: true,
      is_deprecated: false,
    },
    {
      id: 3,
      product_name: 'Portable Bluetooth Speaker',
      product_description: 'Compact and powerful speaker with 360-degree sound and 12-hour battery.',
      unit_price: 89.99,
      compare_at_price: 109.99,
      cost_per_item: 35.00,
      product_sku: 'SPK-BT-003',
      product_category: 'Electronics',
      stock_quantity: 78,
      low_stock_threshold: 15,
      rating_score: 4.3,
      image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'IN_STOCK',
      product_tags: 'audio, bluetooth, speaker, portable',
      product_weight: 420,
      product_dimensions: '12 x 10 x 10 cm',
      is_deprecated: false,
    },
    {
      id: 4,
      product_name: 'USB-C Hub Adapter (Old Model)',
      product_description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery.',
      unit_price: 49.99,
      compare_at_price: null,
      cost_per_item: 20.00,
      product_sku: 'HUB-USB-004',
      product_category: 'Accessories',
      stock_quantity: 0,
      low_stock_threshold: 10,
      rating_score: 4.1,
      image_url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'OUT_OF_STOCK',
      product_tags: 'usb-c, hub, adapter, accessories',
      product_weight: 150,
      product_dimensions: '15 x 8 x 3 cm',
      is_deprecated: true,
    },
    {
      id: 5,
      product_name: 'Mechanical Keyboard',
      product_description: 'RGB backlit mechanical keyboard with Cherry MX switches and programmable keys.',
      unit_price: 149.99,
      compare_at_price: 179.99,
      cost_per_item: 65.00,
      product_sku: 'KBD-MCH-005',
      product_category: 'Accessories',
      stock_quantity: 32,
      low_stock_threshold: 12,
      rating_score: 4.7,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: true,
      product_status: 'IN_STOCK',
      product_tags: 'keyboard, mechanical, gaming, rgb',
      product_weight: 950,
      product_dimensions: '44 x 14 x 3.5 cm',
      is_deprecated: false,
    },
    {
      id: 6,
      product_name: 'Ergonomic Mouse',
      product_description: 'Vertical ergonomic mouse with adjustable DPI and wireless connectivity.',
      unit_price: 59.99,
      compare_at_price: 74.99,
      cost_per_item: 22.00,
      product_sku: 'MSE-ERG-006',
      product_category: 'Accessories',
      stock_quantity: 56,
      low_stock_threshold: 14,
      rating_score: 4.4,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'IN_STOCK',
      product_tags: 'mouse, ergonomic, wireless, accessories',
      product_weight: 125,
      product_dimensions: '7 x 7 x 10 cm',
      is_deprecated: false,
    },
    {
      id: 7,
      product_name: 'Laptop Stand',
      product_description: 'Adjustable aluminum laptop stand with heat dissipation design.',
      unit_price: 39.99,
      compare_at_price: 49.99,
      cost_per_item: 16.00,
      product_sku: 'STD-LAP-007',
      product_category: 'Accessories',
      stock_quantity: 89,
      low_stock_threshold: 18,
      rating_score: 4.2,
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'IN_STOCK',
      product_tags: 'laptop, stand, aluminum, accessories',
      product_weight: 680,
      product_dimensions: '26 x 20 x 3 cm',
      is_deprecated: false,
    },
    {
      id: 8,
      product_name: 'Webcam HD 1080p (Discontinued)',
      product_description: 'Full HD webcam with auto-focus, noise reduction, and built-in microphone.',
      unit_price: 79.99,
      compare_at_price: null,
      cost_per_item: 32.00,
      product_sku: 'WBC-HD-008',
      product_category: 'Electronics',
      stock_quantity: 8,
      low_stock_threshold: 11,
      rating_score: 4.6,
      image_url: 'https://images.unsplash.com/photo-1593640495390-c1c3dfe84c78?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'LOW_STOCK',
      product_tags: 'webcam, 1080p, camera, electronics',
      product_weight: 95,
      product_dimensions: '9 x 9 x 7.5 cm',
      is_deprecated: true,
    },
    {
      id: 9,
      product_name: 'Wireless Gaming Mouse',
      product_description: 'High-precision wireless gaming mouse with RGB lighting and 20,000 DPI sensor.',
      unit_price: 79.99,
      compare_at_price: 99.99,
      cost_per_item: 28.00,
      product_sku: 'MSE-GMG-009',
      product_category: 'Accessories',
      stock_quantity: 25,
      low_stock_threshold: 13,
      rating_score: 4.6,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'IN_STOCK',
      product_tags: 'mouse, gaming, wireless, rgb',
      product_weight: 115,
      product_dimensions: '12 x 8 x 4 cm',
      is_deprecated: false,
    },
    {
      id: 10,
      product_name: '4K Monitor 27"',
      product_description: 'Ultra HD 4K monitor with HDR support, 144Hz refresh rate, and USB-C connectivity.',
      unit_price: 549.99,
      compare_at_price: 649.99,
      cost_per_item: 280.00,
      product_sku: 'MON-4K-010',
      product_category: 'Electronics',
      stock_quantity: 18,
      low_stock_threshold: 10,
      rating_score: 4.9,
      image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: true,
      product_status: 'IN_STOCK',
      product_tags: 'monitor, 4k, display, electronics',
      product_weight: 5200,
      product_dimensions: '61 x 37 x 5 cm',
      is_deprecated: false,
    },
    {
      id: 11,
      product_name: 'Desk Organizer Set (Legacy)',
      product_description: 'Premium desk organizer with pen holder, document tray, and cable management.',
      unit_price: 34.99,
      compare_at_price: null,
      cost_per_item: 12.00,
      product_sku: 'ORG-DSK-011',
      product_category: 'Accessories',
      stock_quantity: 67,
      low_stock_threshold: 16,
      rating_score: 4.3,
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'IN_STOCK',
      product_tags: 'organizer, desk, accessories, storage',
      product_weight: 450,
      product_dimensions: '30 x 15 x 10 cm',
      is_deprecated: true,
    },
    {
      id: 12,
      product_name: 'LED Desk Lamp',
      product_description: 'Adjustable LED desk lamp with touch control, USB charging port, and eye-care mode.',
      unit_price: 45.99,
      compare_at_price: 59.99,
      cost_per_item: 18.00,
      product_sku: 'LMP-LED-012',
      product_category: 'Accessories',
      stock_quantity: 41,
      low_stock_threshold: 15,
      rating_score: 4.4,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      gallery_images: [],
      product_variants: [],
      is_favorite: false,
      product_status: 'IN_STOCK',
      product_tags: 'lamp, led, desk, lighting',
      product_weight: 280,
      product_dimensions: '15 x 15 x 45 cm',
      is_deprecated: false,
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
   * Always returns DTOs and maps them to simulate real API behavior
   */
  private getMockProducts(): Observable<Product[]> {
    const dtos = [...this.mockProductDtos];
    return of(dtos).pipe(
      map((dtos) => this.productMapper.fromDtoArray(dtos)),
      delay(this.getRandomDelay())
    );
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
   * Always returns DTOs and maps them to simulate real API behavior
   */
  private getMockProductById(id: number): Observable<Product | undefined> {
    const dto = this.mockProductDtos.find((p) => p.id === id);
    if (!dto) {
      return of(undefined).pipe(delay(this.getRandomDelay()));
    }
    return of(dto).pipe(
      map((dto) => this.productMapper.fromDto(dto)),
      delay(this.getRandomDelay())
    );
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
   * Always returns DTOs and maps them to simulate real API behavior
   */
  private mockSearchProducts(query: string): Observable<Product[]> {
    const lowerQuery = query.toLowerCase().trim();

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
   * Modifies DTO data source to simulate real API behavior
   */
  private mockToggleFavorite(productId: number): Observable<boolean> {
    const dto = this.mockProductDtos.find((p) => p.id === productId);
    if (dto) {
      dto.is_favorite = !dto.is_favorite;
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
   * Modifies DTO data source to simulate real API behavior
   */
  private mockDeleteProduct(productId: number): Observable<boolean> {
    const index = this.mockProductDtos.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.mockProductDtos.splice(index, 1);
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
   * Creates in DTO format and maps to entity to simulate real API behavior
   */
  private mockCreateProduct(product: Partial<Product>): Observable<Product> {
    const newId = Math.max(...this.mockProductDtos.map((p) => p.id)) + 1;
    const newDto: ProductApiDto = {
      id: newId,
      product_name: product.name || 'New Product',
      product_description: product.description || '',
      product_category: product.category || 'Uncategorized',
      product_status: product.status === 'in-stock' ? 'IN_STOCK' : 'DRAFT',
      unit_price: product.price || 0,
      compare_at_price: product.compareAtPrice || null,
      cost_per_item: product.costPerItem || null,
      product_sku: product.sku || 'SKU-' + newId,
      stock_quantity: product.stock || 0,
      low_stock_threshold: product.lowStockThreshold || null,
      image_url: product.image || '',
      gallery_images: product.galleryImages || [],
      product_variants: [],
      product_tags: product.tags || '',
      product_weight: product.weight || null,
      product_dimensions: product.dimensions || '',
      rating_score: product.rating || 0,
      is_favorite: product.isFavorite || false,
      is_deprecated: product.deprecated || false,
    };

    this.mockProductDtos.push(newDto);

    return of(newDto).pipe(
      map((dto) => this.productMapper.fromDto(dto)),
      delay(this.getRandomDelay())
    );
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
   * Updates DTO and maps to entity to simulate real API behavior
   */
  private mockUpdateProduct(productId: number, updates: Partial<Product>): Observable<Product> {
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

    return of(dto).pipe(
      map((dto) => this.productMapper.fromDto(dto)),
      delay(this.getRandomDelay())
    );
  }
}

/**
 * Product Mapper Service
 * Handles serialization (Entity → DTO) and deserialization (DTO → Entity)
 * between API responses and internal Product entities
 *
 * This mapper pattern ensures:
 * - Separation of concerns between API and internal models
 * - Easy adaptation when API structure changes
 * - Type safety during transformations
 * - Centralized mapping logic
 */

import { Injectable } from '@angular/core';
import { Product, ProductFormData } from '../entities';
import { ProductApiDto, ProductCreateDto, ProductUpdateDto } from '../entities/product-api.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductMapper {
  /**
   * DESERIALIZATION: Convert API DTO to Product Entity
   * Use this when receiving data FROM the backend API
   *
   * @param dto - Product data from API (snake_case)
   * @returns Product - Internal entity (camelCase)
   */
  fromDto(dto: ProductApiDto): Product {
    return {
      id: dto.id,
      name: dto.product_name,
      description: dto.product_description,
      category: dto.product_category,
      price: dto.unit_price,
      stock: dto.stock_quantity,
      rating: dto.rating_score || 0,
      image: dto.image_url,
      isFavorite: dto.is_favorite,
      status: this.mapApiStatusToEntityStatus(dto.product_status),
      deprecated: dto.is_deprecated || false,
    };
  }

  /**
   * DESERIALIZATION (Batch): Convert array of API DTOs to Product Entities
   *
   * @param dtos - Array of product DTOs from API
   * @returns Product[] - Array of internal entities
   */
  fromDtoArray(dtos: ProductApiDto[]): Product[] {
    return dtos.map((dto) => this.fromDto(dto));
  }

  /**
   * SERIALIZATION: Convert Product Entity to Create DTO
   * Use this when CREATING a new product via API
   *
   * @param product - Internal product entity or form data
   * @returns ProductCreateDto - DTO for API request
   */
  toCreateDto(product: Partial<Product> | ProductFormData): ProductCreateDto {
    return {
      product_name: product.name || '',
      product_description: product.description || '',
      product_category: product.category || '',
      unit_price: product.price || 0,
      stock_quantity: product.stock || 0,
      image_url: this.getImageUrl(product),
      product_status: this.mapEntityStatusToApiStatus(product.status || 'draft'),
      is_deprecated: this.isDeprecated(product),
      rating_score: this.getRating(product),
    };
  }

  /**
   * SERIALIZATION: Convert Product Entity to Update DTO
   * Use this when UPDATING an existing product via API
   *
   * @param updates - Partial product data to update
   * @returns ProductUpdateDto - DTO for API PATCH/PUT request
   */
  toUpdateDto(updates: Partial<Product> | Partial<ProductFormData>): ProductUpdateDto {
    const dto: ProductUpdateDto = {};

    if (updates.name !== undefined) dto.product_name = updates.name;
    if (updates.description !== undefined) dto.product_description = updates.description;
    if (updates.category !== undefined) dto.product_category = updates.category;
    if (updates.price !== undefined) dto.unit_price = updates.price;
    if (updates.stock !== undefined) dto.stock_quantity = updates.stock;
    if (updates.status !== undefined) dto.product_status = this.mapEntityStatusToApiStatus(updates.status);

    // Handle image URL from different sources
    const imageUrl = this.getImageUrl(updates);
    if (imageUrl) dto.image_url = imageUrl;

    // Handle deprecated flag
    const deprecated = this.isDeprecated(updates);
    if (deprecated !== undefined) dto.is_deprecated = deprecated;

    // Handle rating
    const rating = this.getRating(updates);
    if (rating !== undefined) dto.rating_score = rating;

    return dto;
  }

  /**
   * Map API status to internal entity status
   * Handles different naming conventions between API and internal models
   */
  private mapApiStatusToEntityStatus(apiStatus: string): 'in-stock' | 'low-stock' | 'out-of-stock' {
    // Handle various API status formats
    const normalized = apiStatus?.toLowerCase().replace(/[_\s-]/g, '');

    switch (normalized) {
      case 'instock':
      case 'active':
      case 'available':
        return 'in-stock';

      case 'lowstock':
      case 'low':
        return 'low-stock';

      case 'outofstock':
      case 'unavailable':
      case 'soldout':
        return 'out-of-stock';

      default:
        // Default to in-stock if status is unknown
        return 'in-stock';
    }
  }

  /**
   * Map internal entity status to API status
   * Converts from internal format to API expected format
   */
  private mapEntityStatusToApiStatus(entityStatus: string): string {
    switch (entityStatus) {
      case 'in-stock':
      case 'active':
        return 'IN_STOCK';

      case 'low-stock':
        return 'LOW_STOCK';

      case 'out-of-stock':
        return 'OUT_OF_STOCK';

      case 'draft':
        return 'DRAFT';

      case 'archived':
        return 'ARCHIVED';

      default:
        return 'DRAFT';
    }
  }

  /**
   * Helper: Get image URL from various product sources
   */
  private getImageUrl(product: any): string {
    // Check for different possible image field names
    return product.image || product.imageUrl || product.image_url || '';
  }

  /**
   * Helper: Get deprecated status from various product sources
   */
  private isDeprecated(product: any): boolean {
    return product.deprecated || product.is_deprecated || false;
  }

  /**
   * Helper: Get rating from various product sources
   */
  private getRating(product: any): number | undefined {
    return product.rating || product.rating_score;
  }

  /**
   * Convert ProductFormData to Product entity
   * Useful when creating a product from the form wizard
   *
   * @param formData - Data from product creation form
   * @param id - Optional product ID (for updates)
   * @returns Product - Internal product entity
   */
  fromFormData(formData: ProductFormData, id?: number): Partial<Product> {
    return {
      id: id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price || 0,
      stock: formData.stock || 0,
      rating: 0, // New products start with 0 rating
      image: formData.imageUrl,
      isFavorite: false, // New products start as non-favorite
      status: this.mapEntityStatusToEntityStatus(formData.status),
      deprecated: false, // New products are not deprecated
    };
  }

  /**
   * Map form status to entity status
   */
  private mapEntityStatusToEntityStatus(status: string): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (status === 'active') return 'in-stock';
    if (status === 'archived') return 'out-of-stock';
    return 'in-stock'; // Default for draft
  }

  /**
   * Validate that a DTO has all required fields
   * Useful for debugging API responses
   *
   * @param dto - Product DTO to validate
   * @returns boolean - True if valid
   */
  isValidDto(dto: any): dto is ProductApiDto {
    return (
      dto &&
      typeof dto.id === 'number' &&
      typeof dto.product_name === 'string' &&
      typeof dto.unit_price === 'number' &&
      typeof dto.stock_quantity === 'number'
    );
  }

  /**
   * Sanitize and validate product data before sending to API
   * Removes null/undefined values and ensures data integrity
   *
   * @param dto - DTO to sanitize
   * @returns Sanitized DTO
   */
  sanitizeDto<T extends Record<string, any>>(dto: T): T {
    const sanitized: any = {};

    Object.keys(dto).forEach((key) => {
      const value = dto[key];

      // Remove null, undefined, and empty strings
      if (value !== null && value !== undefined && value !== '') {
        sanitized[key] = value;
      }
    });

    return sanitized as T;
  }
}

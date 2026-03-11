/**
 * Data Transfer Objects (DTOs) for Product API
 * These represent the structure of data as it comes from/goes to the backend API
 *
 * Use these DTOs when the API response structure differs from your internal Product entity
 *
 * Example: API uses snake_case, but TypeScript uses camelCase
 */

/**
 * Product Variant DTO from API
 */
export interface ProductVariantApiDto {
  id: string;
  variant_name: string;
  variant_sku: string;
  variant_price: number | null;
  variant_stock: number | null;
  variant_attributes: { [key: string]: string };
}

/**
 * Product DTO from API Response
 * This represents how the backend API returns product data
 */
export interface ProductApiDto {
  // Basic fields
  id: number;
  product_name: string;  // Maps to: name
  product_description: string;  // Maps to: description
  product_category: string;  // Maps to: category
  product_status: string;  // Maps to: status

  // Pricing & Stock
  unit_price: number;  // Maps to: price
  compare_at_price: number | null;  // Maps to: compareAtPrice
  cost_per_item: number | null;  // Maps to: costPerItem
  product_sku: string;  // Maps to: sku
  stock_quantity: number;  // Maps to: stock
  low_stock_threshold: number | null;  // Maps to: lowStockThreshold

  // Images & Media
  image_url: string;  // Maps to: image
  gallery_images: string[];  // Maps to: galleryImages

  // Variants
  product_variants: ProductVariantApiDto[];  // Maps to: variants

  // Additional Details
  product_tags: string;  // Maps to: tags
  product_weight: number | null;  // Maps to: weight
  product_dimensions: string;  // Maps to: dimensions

  // Display attributes
  rating_score: number;  // Maps to: rating
  is_favorite: boolean;  // Maps to: isFavorite
  is_deprecated: boolean;  // Maps to: deprecated

  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  last_modified_by?: string;
}

/**
 * Product Create/Update DTO for API Request
 * This represents the structure expected by the backend when creating/updating products
 */
export interface ProductCreateDto {
  product_name: string;
  product_description: string;
  product_category: string;
  unit_price: number;
  stock_quantity: number;
  image_url: string;
  product_status: string;
  is_deprecated?: boolean;
  rating_score?: number;
}

/**
 * Product Update DTO for API Request (Partial)
 * Used for PATCH/PUT requests where only some fields are updated
 */
export interface ProductUpdateDto {
  product_name?: string;
  product_description?: string;
  product_category?: string;
  unit_price?: number;
  stock_quantity?: number;
  image_url?: string;
  product_status?: string;
  is_deprecated?: boolean;
  rating_score?: number;
}

/**
 * API Success Response Wrapper
 * Many APIs wrap responses in a standard structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Paginated API Response
 * For endpoints that return paginated data
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
}

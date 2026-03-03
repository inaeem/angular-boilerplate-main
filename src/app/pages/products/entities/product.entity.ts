/**
 * Product Variant Interface
 * Represents a single variant of a product with different attributes
 * (e.g., different sizes, colors, materials)
 */
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  stock: number | null;
  attributes: { [key: string]: string }; // e.g., { color: 'Red', size: 'L' }
}

/**
 * Product Form Data Interface
 * Used for creating and editing products
 * Contains all fields needed for the product form wizard
 */
export interface ProductFormData {
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

/**
 * Product Display Interface
 * Used for displaying products in lists and cards
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  image: string;
  isFavorite: boolean;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  deprecated: boolean;
}

/**
 * Product Status Enum
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  IN_STOCK = 'in-stock',
  OUT_OF_STOCK = 'out-of-stock',
}

/**
 * Product Category Interface
 */
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

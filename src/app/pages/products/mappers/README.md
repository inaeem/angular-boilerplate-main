# Product Mapper - Serialization & Deserialization

## Overview

The Product Mapper provides a **data transformation layer** between your internal Product entities and external API DTOs (Data Transfer Objects). This pattern ensures clean separation between your frontend models and backend API contracts.

## Why Use Mappers?

### Common Scenarios:

1. **Different Naming Conventions**
   - API uses `snake_case`: `product_name`, `unit_price`
   - Frontend uses `camelCase`: `name`, `price`

2. **Different Data Structures**
   - API returns nested objects
   - Frontend uses flat entities

3. **API Evolution**
   - Backend changes don't break frontend
   - Centralized transformation logic

4. **Type Safety**
   - Compile-time checking for mappings
   - Prevents runtime errors

## Configuration

### Enable/Disable Mapper

Control mapper usage via environment variable:

```typescript
// environment.ts (Development - No mapping)
{
  useMockData: true,
  useApiMapper: false,  // API returns correct format
}

// environment.prod.ts (Production - With mapping)
{
  useMockData: false,
  useApiMapper: true,  // API uses different structure
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                         │
│                   (uses Product entity)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ProductsService                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  if (useApiMapper) {                                  │  │
│  │    // Deserialize: API DTO → Product Entity          │  │
│  │    map(dto => productMapper.fromDto(dto))            │  │
│  │                                                        │  │
│  │    // Serialize: Product Entity → API DTO            │  │
│  │    const dto = productMapper.toCreateDto(product)    │  │
│  │  }                                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API / Backend                           │
│              (expects ProductApiDto format)                  │
└─────────────────────────────────────────────────────────────┘
```

## API DTO Structure

### Example: Backend API Response

```json
{
  "id": 1,
  "product_name": "Premium Headphones",
  "product_description": "High-quality wireless headphones",
  "product_category": "Electronics",
  "unit_price": 299.99,
  "stock_quantity": 45,
  "rating_score": 4.5,
  "image_url": "https://example.com/image.jpg",
  "is_favorite": false,
  "product_status": "IN_STOCK",
  "is_deprecated": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
```

### Internal Product Entity (Frontend)

```typescript
{
  id: 1,
  name: "Premium Headphones",
  description: "High-quality wireless headphones",
  category: "Electronics",
  price: 299.99,
  stock: 45,
  rating: 4.5,
  image: "https://example.com/image.jpg",
  isFavorite: false,
  status: "in-stock",
  deprecated: false
}
```

## Usage Examples

### 1. Deserialization (API → Entity)

**Receiving data FROM the backend:**

```typescript
// In ProductsService
getProducts(): Observable<Product[]> {
  if (this.useApiMapper) {
    return this.http.get<ProductApiDto[]>(url).pipe(
      // Transform API DTOs to Product entities
      map(dtos => this.productMapper.fromDtoArray(dtos))
    );
  }
  // ...
}
```

**Manual deserialization:**

```typescript
import { ProductMapper } from '@pages/products/mappers';

constructor(private productMapper: ProductMapper) {}

processApiResponse(apiDto: ProductApiDto): void {
  // Convert API DTO to Product entity
  const product = this.productMapper.fromDto(apiDto);

  console.log(product.name);  // ✅ 'name' (camelCase)
  console.log(product.price); // ✅ 'price' (not 'unit_price')
}
```

### 2. Serialization (Entity → API)

**Sending data TO the backend:**

```typescript
// In ProductsService
createProduct(product: Partial<Product>): Observable<Product> {
  if (this.useApiMapper) {
    // Transform Product entity to API DTO
    const dto = this.productMapper.toCreateDto(product);

    return this.http.post<ProductApiDto>(url, dto).pipe(
      // Transform response back to entity
      map(responseDto => this.productMapper.fromDto(responseDto))
    );
  }
  // ...
}
```

**Manual serialization:**

```typescript
createNewProduct(): void {
  const product: Partial<Product> = {
    name: 'New Product',
    price: 99.99,
    category: 'Electronics',
    stock: 50
  };

  // Convert to API DTO before sending
  const dto = this.productMapper.toCreateDto(product);

  // dto now has: product_name, unit_price, etc.
  this.http.post('/api/products', dto).subscribe(...);
}
```

### 3. Partial Updates

**Updating specific fields:**

```typescript
updateProductPrice(productId: number, newPrice: number): void {
  const updates: Partial<Product> = { price: newPrice };

  // Convert partial updates to API format
  const dto = this.productMapper.toUpdateDto(updates);

  // Only sends: { unit_price: newPrice }
  this.productsService.updateProduct(productId, updates).subscribe(...);
}
```

### 4. Form Data Conversion

**Converting form data to Product entity:**

```typescript
submitProductForm(formData: ProductFormData): void {
  // Convert form data to Product entity
  const product = this.productMapper.fromFormData(formData);

  this.productsService.createProduct(product).subscribe(...);
}
```

## Mapper Methods

### Deserialization Methods

| Method | Input | Output | Use Case |
|--------|-------|--------|----------|
| `fromDto(dto)` | `ProductApiDto` | `Product` | Single API response |
| `fromDtoArray(dtos)` | `ProductApiDto[]` | `Product[]` | List API response |
| `fromFormData(formData, id?)` | `ProductFormData` | `Partial<Product>` | Form submission |

### Serialization Methods

| Method | Input | Output | Use Case |
|--------|-------|--------|----------|
| `toCreateDto(product)` | `Partial<Product>` | `ProductCreateDto` | Create new product |
| `toUpdateDto(updates)` | `Partial<Product>` | `ProductUpdateDto` | Update existing product |

### Utility Methods

| Method | Description |
|--------|-------------|
| `isValidDto(dto)` | Validates API DTO structure |
| `sanitizeDto(dto)` | Removes null/undefined values |

## Field Mappings

### API DTO → Product Entity

| API Field (snake_case) | Entity Field (camelCase) |
|------------------------|--------------------------|
| `id` | `id` |
| `product_name` | `name` |
| `product_description` | `description` |
| `product_category` | `category` |
| `unit_price` | `price` |
| `stock_quantity` | `stock` |
| `rating_score` | `rating` |
| `image_url` | `image` |
| `is_favorite` | `isFavorite` |
| `product_status` | `status` |
| `is_deprecated` | `deprecated` |

### Status Mappings

**API → Entity:**

| API Status | Entity Status |
|------------|---------------|
| `IN_STOCK` | `in-stock` |
| `LOW_STOCK` | `low-stock` |
| `OUT_OF_STOCK` | `out-of-stock` |
| `ACTIVE` | `in-stock` |
| `DRAFT` | `in-stock` |

**Entity → API:**

| Entity Status | API Status |
|---------------|------------|
| `in-stock` | `IN_STOCK` |
| `low-stock` | `LOW_STOCK` |
| `out-of-stock` | `OUT_OF_STOCK` |
| `active` | `IN_STOCK` |
| `draft` | `DRAFT` |
| `archived` | `ARCHIVED` |

## Advanced Features

### 1. Automatic Status Normalization

The mapper handles various status formats:

```typescript
// All these map to 'in-stock':
'IN_STOCK' → 'in-stock'
'in_stock' → 'in-stock'
'ACTIVE'   → 'in-stock'
'available' → 'in-stock'
```

### 2. Null Safety

The mapper handles missing/null values gracefully:

```typescript
fromDto({
  id: 1,
  product_name: 'Product',
  rating_score: null  // ← null from API
})

// Result:
{
  id: 1,
  name: 'Product',
  rating: 0  // ✅ Defaults to 0
}
```

### 3. Sanitization

Remove empty values before sending to API:

```typescript
const dto = {
  product_name: 'Product',
  unit_price: 99.99,
  stock_quantity: null,    // ← will be removed
  rating_score: undefined  // ← will be removed
};

const clean = productMapper.sanitizeDto(dto);
// { product_name: 'Product', unit_price: 99.99 }
```

## Testing

### Unit Test Example

```typescript
import { ProductMapper } from './product.mapper';
import { ProductApiDto } from '../entities/product-api.dto';

describe('ProductMapper', () => {
  let mapper: ProductMapper;

  beforeEach(() => {
    mapper = new ProductMapper();
  });

  it('should deserialize API DTO to Product entity', () => {
    const dto: ProductApiDto = {
      id: 1,
      product_name: 'Test Product',
      unit_price: 99.99,
      stock_quantity: 10,
      // ... other fields
    };

    const product = mapper.fromDto(dto);

    expect(product.id).toBe(1);
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe(99.99);
    expect(product.stock).toBe(10);
  });

  it('should serialize Product entity to API DTO', () => {
    const product = {
      name: 'New Product',
      price: 149.99,
      category: 'Electronics',
    };

    const dto = mapper.toCreateDto(product);

    expect(dto.product_name).toBe('New Product');
    expect(dto.unit_price).toBe(149.99);
    expect(dto.product_category).toBe('Electronics');
  });
});
```

## Best Practices

### ✅ Do:

1. **Always use mapper** when `useApiMapper: true`
2. **Keep mapper logic simple** - just field transformations
3. **Add validation** for critical fields
4. **Document custom mappings** in comments
5. **Test mapper thoroughly** - unit tests for all transformations

### ❌ Don't:

1. **Don't add business logic** - mappers only transform data
2. **Don't make HTTP calls** in mapper methods
3. **Don't modify original objects** - always return new ones
4. **Don't ignore type safety** - use proper TypeScript types

## Troubleshooting

### Issue: API returns unexpected field names

**Solution:** Update field mappings in `product.mapper.ts`:

```typescript
fromDto(dto: ProductApiDto): Product {
  return {
    // Add your custom field mapping
    name: dto.product_title || dto.product_name,
    price: dto.cost || dto.unit_price,
    // ...
  };
}
```

### Issue: Status values don't match

**Solution:** Update `mapApiStatusToEntityStatus()`:

```typescript
private mapApiStatusToEntityStatus(apiStatus: string): ProductStatus {
  switch (apiStatus) {
    case 'YOUR_API_STATUS':
      return 'in-stock';
    // ...
  }
}
```

### Issue: Missing fields in API response

**Solution:** Add default values in mapper:

```typescript
fromDto(dto: ProductApiDto): Product {
  return {
    rating: dto.rating_score ?? 0,  // Default to 0
    deprecated: dto.is_deprecated ?? false,  // Default to false
    // ...
  };
}
```

## Summary

The Product Mapper provides a **clean, maintainable, and type-safe** way to handle differences between your frontend models and backend API contracts. It's controlled by a single environment flag and works seamlessly with the ProductsService.

**Key Benefits:**
- ✅ Decouples frontend from backend changes
- ✅ Type-safe transformations
- ✅ Centralized mapping logic
- ✅ Easy to test and maintain
- ✅ Supports both directions (API ↔ Entity)

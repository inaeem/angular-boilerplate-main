# Products Service - API & Mock Data Configuration

## Overview

The `ProductsService` supports both **mock data** and **real REST API endpoints**, controlled through environment variables. This allows for flexible development and testing workflows.

## Configuration

### Environment Variables

Configuration is managed in `src/environments/environment.ts` (development) and `src/environments/environment.prod.ts` (production).

**Key Settings:**

```typescript
{
  useMockData: true,  // true = use mock data, false = use real API
  apiBaseUrl: 'http://localhost:3000/api',  // Base URL for API
  apiEndpoints: {
    products: {
      getAll: '/products',
      getById: '/products/:id',
      create: '/products',
      update: '/products/:id',
      delete: '/products/:id',
      search: '/products/search',
      toggleFavorite: '/products/:id/favorite',
    },
  },
  apiTimeout: 30000,  // API request timeout (30 seconds)
  mockDataDelay: { min: 3000, max: 5000 },  // Mock delay range (3-5 seconds)
}
```

### Switching Between Mock and API Modes

**Development (Mock Data):**
```typescript
// src/environments/environment.ts
useMockData: true
```

**Production (Real API):**
```typescript
// src/environments/environment.prod.ts
useMockData: false
apiBaseUrl: 'https://api.yourapp.com/api'
```

## API Endpoints

All endpoints are automatically constructed using the `apiBaseUrl` and endpoint paths defined in the environment configuration.

### Available Endpoints

| Method | Endpoint | Description | Mock Support |
|--------|----------|-------------|--------------|
| GET | `/products` | Get all products | ✅ |
| GET | `/products/:id` | Get product by ID | ✅ |
| GET | `/products/search?q={query}` | Search products | ✅ |
| POST | `/products` | Create new product | ✅ |
| PUT | `/products/:id` | Update product | ✅ |
| DELETE | `/products/:id` | Delete product | ✅ |
| PATCH | `/products/:id/favorite` | Toggle favorite status | ✅ |

### Example API Requests

**Get All Products:**
```
GET http://localhost:3000/api/products
```

**Get Product by ID:**
```
GET http://localhost:3000/api/products/1
```

**Search Products:**
```
GET http://localhost:3000/api/products/search?q=headphones
```

**Create Product:**
```
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "category": "Electronics",
  "price": 99.99,
  "stock": 50,
  "image": "https://example.com/image.jpg"
}
```

**Update Product:**
```
PUT http://localhost:3000/api/products/1
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 149.99
}
```

**Delete Product:**
```
DELETE http://localhost:3000/api/products/1
```

## Expected API Response Formats

### Product Object

```typescript
{
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
```

### Success Response (Delete/Toggle)

```typescript
{
  success: boolean;
}
```

## Error Handling

The service includes comprehensive error handling:

- **Timeout:** Requests timeout after 30 seconds (configurable)
- **Network Errors:** Caught and logged to console
- **HTTP Errors:** Propagated to components via `catchError`
- **404 Not Found:** Handled gracefully in mock mode

**Error Response Example:**
```typescript
{
  error: string;
  message: string;
  statusCode: number;
}
```

## Mock Data Features

When `useMockData: true`:

- ✅ 12 pre-loaded sample products
- ✅ Realistic 3-5 second delays (simulates network latency)
- ✅ Full CRUD operations (in-memory only)
- ✅ Search functionality with filtering
- ✅ Favorite toggle support
- ✅ No backend server required
- ✅ **Smart DTO handling** - Returns API DTOs when `useApiMapper: true`

### Mock Data Behavior

The service maintains **two separate mock datasets**:

1. **`mockProductDtos`** - API DTO format (snake_case)
   - Used when `useApiMapper: true`
   - Ensures mapper is exercised even with mock data
   - Simulates real API behavior

2. **`mockProducts`** - Product entity format (camelCase)
   - Used when `useApiMapper: false`
   - No mapping overhead
   - Direct entity format

**Why This Matters:**

When `useApiMapper: true`, mock data flows through the mapper **just like real API data**:

```
Mock DTO → Mapper → Product Entity → Component
```

This ensures:
- ✅ Mapper is tested with mock data
- ✅ No behavioral differences between mock and API modes
- ✅ Consistent transformation logic
- ✅ Early detection of mapping issues

**Benefits:**
- Rapid prototyping
- Offline development
- Automated testing with mapper
- Demo presentations
- Mapper validation without backend

## Integration with Backend API

To integrate with a real backend:

1. **Update environment configuration:**
   ```typescript
   // environment.prod.ts
   useMockData: false,
   apiBaseUrl: 'https://api.yourapp.com/api'
   ```

2. **Ensure backend endpoints match:**
   - Verify endpoint paths match the configuration
   - Ensure response formats match the `Product` interface
   - Add proper CORS headers if needed

3. **Authentication:**
   - The `ApiPrefixInterceptor` automatically adds `Authorization: Bearer {token}`
   - Ensure your backend validates JWT tokens

4. **Language Headers:**
   - Requests include `Accept-Language`, `Content-Language`, and `lang` headers
   - Use these for i18n support

## Testing

### Test with Mock Data
```bash
# Development environment (mock data enabled)
npm start
```

### Test with Real API
```bash
# Update environment.ts temporarily
useMockData: false

# Or build for production
npm run build
```

## Service Usage Example

```typescript
import { ProductsService } from '@pages/products/services/products.service';

export class MyComponent {
  constructor(private productsService: ProductsService) {}

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }
}
```

## Notes

- URL parameters (`:id`) are automatically replaced by the service
- All HTTP requests include timeout protection
- Mock data persists only during the session (lost on refresh)
- The service is provided at the root level (`providedIn: 'root'`)

## Future Enhancements

- [ ] Pagination support
- [ ] Sorting and filtering
- [ ] Batch operations
- [ ] Product variants API
- [ ] Image upload endpoint
- [ ] Category management

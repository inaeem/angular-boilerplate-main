import { env } from './.env';

export const environment = {
  production: false,
  version: env['npm_package_version'] + '-dev',
  defaultLanguage: 'de-DE',
  supportedLanguages: ['de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT'],

  // API Configuration
  useMockData: true, // Set to false to use real API endpoints
  useApiMapper: false, // Set to true if API uses different structure (snake_case, etc.)
  apiBaseUrl: 'http://localhost:3000/api', // Base URL for API endpoints
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
  apiTimeout: 30000, // API request timeout in milliseconds
  mockDataDelay: { min: 3000, max: 5000 }, // Delay range for mock data (3-5 seconds)
};

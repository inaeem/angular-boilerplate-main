/**
 * Provider File Upload Interface
 * Represents a file uploaded by the provider
 */
export interface ProviderFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

/**
 * Provider Plan Interface
 * Represents an application plan that can be selected
 */
export interface ProviderPlan {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

/**
 * Provider Display Interface
 * Used for displaying providers in lists and detail views
 */
export interface Provider {
  id: number;

  // Application Details (Step 1)
  applicationName: string;
  applicationDescription: string;
  logo: ProviderFile | null;
  selectedPlans: number[]; // Array of plan IDs

  // Contact Information (Step 1)
  contactPersonName: string;
  designation: string;
  officialEmail: string;

  // Business Information (Step 1)
  businessUrl: string;
  registeredBusinessAddress: string;

  // Personal Identity (Step 2)
  licenseNumber: string;
  dateOfBirth: string;
  age: number;

  // OAuth Settings (Step 3)
  allowedGrant: string; // 'authorization_code' | 'client_credentials' | 'implicit'
  redirectUrls: string[];

  // Optional Configuration (Step 4)
  sandboxUrl: string;
  isCertified: boolean;
  comments: string;
  additionalFiles: ProviderFile[];

  // System fields
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
}

/**
 * Provider Form Data Interface
 * Used for creating and editing providers (matches the form structure)
 */
export interface ProviderFormData {
  // Step 1: Application Information
  applicationName: string;
  applicationDescription: string;
  logo: ProviderFile | null;
  selectedPlans: number[];
  contactPersonName: string;
  designation: string;
  officialEmail: string;
  businessUrl: string;
  registeredBusinessAddress: string;

  // Step 2: Personal Information
  licenseNumber: string;
  dateOfBirth: string;
  age: number | null;

  // Step 3: Authorization and Scopes
  allowedGrant: string;
  redirectUrls: string[];

  // Step 4: Additional Configuration
  sandboxUrl: string;
  isCertified: boolean;
  comments: string;
  additionalFiles: ProviderFile[];
}

/**
 * Provider Status Enum
 */
export enum ProviderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

/**
 * LOB Status Interface
 * Tracks the status of each Line of Business (Plan) for a provider
 */
export interface LOBStatus {
  planId: number;
  isActive: boolean;
  deactivatedAt?: Date;
  deactivationReason?: string;
}

/**
 * Deactivation Request Interface
 * Used when deactivating a provider or specific LOBs
 */
export interface DeactivationRequest {
  providerId: number;
  deactivateEntireProvider: boolean;
  selectedLOBs: number[]; // Plan IDs to deactivate
  reason: string;
  deactivatedBy?: string;
  deactivatedAt: Date;
}

/**
 * Provider File DTO
 * API representation of an uploaded file
 */
export interface ProviderFileApiDto {
  file_name: string;
  file_type: string;
  file_size: number;
  file_data_url: string;
}

/**
 * Provider API DTO
 * Backend API representation of a provider (snake_case)
 */
export interface ProviderApiDto {
  id: number;

  // Application Details
  application_name: string;
  application_description: string;
  logo: ProviderFileApiDto | null;
  selected_plan_ids: number[];

  // Contact Information
  contact_person_name: string;
  designation: string;
  official_email: string;

  // Business Information
  business_url: string;
  registered_business_address: string;

  // Personal Identity
  license_number: string;
  date_of_birth: string;
  age: number;

  // OAuth Settings
  allowed_grant_type: string;
  redirect_urls: string[];

  // Optional Configuration
  sandbox_url: string;
  is_certified: boolean;
  comments: string;
  additional_files: ProviderFileApiDto[];

  // System fields
  created_at: string;
  updated_at: string;
  status: string;
}

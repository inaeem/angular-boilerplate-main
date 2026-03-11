import { Provider, ProviderFile } from './provider.entity';
import { ProviderApiDto, ProviderFileApiDto } from './provider-api.dto';

/**
 * Provider Mapper
 * Converts between API DTOs (snake_case) and frontend entities (camelCase)
 */
export class ProviderMapper {
  /**
   * Convert API DTO to frontend Provider entity
   */
  static fromDto(dto: ProviderApiDto): Provider {
    return {
      id: dto.id,

      // Application Details
      applicationName: dto.application_name,
      applicationDescription: dto.application_description,
      logo: dto.logo ? this.fromFileDto(dto.logo) : null,
      selectedPlans: dto.selected_plan_ids,

      // Contact Information
      contactPersonName: dto.contact_person_name,
      designation: dto.designation,
      officialEmail: dto.official_email,

      // Business Information
      businessUrl: dto.business_url,
      registeredBusinessAddress: dto.registered_business_address,

      // Personal Identity
      licenseNumber: dto.license_number,
      dateOfBirth: dto.date_of_birth,
      age: dto.age,

      // OAuth Settings
      allowedGrant: dto.allowed_grant_type,
      redirectUrls: dto.redirect_urls,

      // Optional Configuration
      sandboxUrl: dto.sandbox_url,
      isCertified: dto.is_certified,
      comments: dto.comments,
      additionalFiles: dto.additional_files.map(file => this.fromFileDto(file)),

      // System fields
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      status: dto.status as Provider['status'],
    };
  }

  /**
   * Convert frontend Provider entity to API DTO
   */
  static toDto(provider: Provider): ProviderApiDto {
    return {
      id: provider.id,

      // Application Details
      application_name: provider.applicationName,
      application_description: provider.applicationDescription,
      logo: provider.logo ? this.toFileDto(provider.logo) : null,
      selected_plan_ids: provider.selectedPlans,

      // Contact Information
      contact_person_name: provider.contactPersonName,
      designation: provider.designation,
      official_email: provider.officialEmail,

      // Business Information
      business_url: provider.businessUrl,
      registered_business_address: provider.registeredBusinessAddress,

      // Personal Identity
      license_number: provider.licenseNumber,
      date_of_birth: provider.dateOfBirth,
      age: provider.age,

      // OAuth Settings
      allowed_grant_type: provider.allowedGrant,
      redirect_urls: provider.redirectUrls,

      // Optional Configuration
      sandbox_url: provider.sandboxUrl,
      is_certified: provider.isCertified,
      comments: provider.comments,
      additional_files: provider.additionalFiles.map(file => this.toFileDto(file)),

      // System fields
      created_at: provider.createdAt.toISOString(),
      updated_at: provider.updatedAt.toISOString(),
      status: provider.status,
    };
  }

  /**
   * Convert API File DTO to frontend ProviderFile
   */
  static fromFileDto(dto: ProviderFileApiDto): ProviderFile {
    return {
      name: dto.file_name,
      type: dto.file_type,
      size: dto.file_size,
      dataUrl: dto.file_data_url,
    };
  }

  /**
   * Convert frontend ProviderFile to API File DTO
   */
  static toFileDto(file: ProviderFile): ProviderFileApiDto {
    return {
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data_url: file.dataUrl,
    };
  }
}

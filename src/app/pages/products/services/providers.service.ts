import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Provider, ProviderFile, ProviderStatus } from '../entities/provider.entity';

@Injectable({
  providedIn: 'root',
})
export class ProvidersService {
  private providers: Provider[] = this.generateMockProviders();

  /**
   * Get all providers
   */
  getProviders(): Observable<Provider[]> {
    return of(this.providers).pipe(delay(800));
  }

  /**
   * Get provider by ID
   */
  getProviderById(id: number): Observable<Provider | undefined> {
    const provider = this.providers.find((p) => p.id === id);
    return of(provider).pipe(delay(500));
  }

  /**
   * Create new provider
   */
  createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Observable<Provider> {
    const newProvider: Provider = {
      ...provider,
      id: Math.max(...this.providers.map((p) => p.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.providers.push(newProvider);
    return of(newProvider).pipe(delay(1000));
  }

  /**
   * Update existing provider
   */
  updateProvider(id: number, provider: Partial<Provider>): Observable<Provider> {
    const index = this.providers.findIndex((p) => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Provider not found'));
    }
    this.providers[index] = {
      ...this.providers[index],
      ...provider,
      updatedAt: new Date(),
    };
    return of(this.providers[index]).pipe(delay(1000));
  }

  /**
   * Delete provider
   */
  deleteProvider(id: number): Observable<boolean> {
    const index = this.providers.findIndex((p) => p.id === id);
    if (index === -1) {
      return of(false).pipe(delay(500));
    }
    this.providers.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: number): Observable<boolean> {
    const provider = this.providers.find((p) => p.id === id);
    if (provider) {
      // Providers don't have favorite field by default, but we can add it if needed
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  /**
   * Generate mock provider data
   */
  private generateMockProviders(): Provider[] {
    const baseDate = new Date('2024-01-01');

    return [
      {
        id: 1,
        applicationName: 'HealthConnect API',
        applicationDescription: 'Comprehensive healthcare data integration platform providing secure access to patient records, appointments, and medical history.',
        logo: this.createMockLogo(1),
        selectedPlans: [1, 2],
        contactPersonName: 'Dr. Sarah Johnson',
        designation: 'Chief Technology Officer',
        officialEmail: 'sarah.johnson@healthconnect.com',
        businessUrl: 'https://www.healthconnect.com',
        registeredBusinessAddress: '123 Medical Plaza, Suite 500, Boston, MA 02115',
        licenseNumber: 'HC-2024-001-MA',
        dateOfBirth: '1985-03-15',
        age: 39,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://healthconnect.com/oauth/callback', 'https://app.healthconnect.com/auth'],
        sandboxUrl: 'https://sandbox.healthconnect.com/api',
        isCertified: true,
        comments: 'HIPAA compliant. Requires additional security review for production access.',
        additionalFiles: [
          this.createMockFile('hipaa-certification.pdf', 'application/pdf', 250000),
          this.createMockFile('security-audit-2024.pdf', 'application/pdf', 180000),
        ],
        createdAt: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 2,
        applicationName: 'FinanceHub Pro',
        applicationDescription: 'Enterprise-grade financial management system with real-time transaction processing and comprehensive reporting capabilities.',
        logo: this.createMockLogo(2),
        selectedPlans: [2, 3],
        contactPersonName: 'Michael Chen',
        designation: 'Product Manager',
        officialEmail: 'michael.chen@financehub.io',
        businessUrl: 'https://www.financehub.io',
        registeredBusinessAddress: '456 Finance Street, 12th Floor, New York, NY 10004',
        licenseNumber: 'FH-2024-002-NY',
        dateOfBirth: '1990-07-22',
        age: 34,
        allowedGrant: 'client_credentials',
        redirectUrls: ['https://financehub.io/callback', 'https://dashboard.financehub.io/auth/return'],
        sandboxUrl: 'https://sandbox-api.financehub.io',
        isCertified: true,
        comments: 'SOC 2 Type II certified. Approved for banking integrations.',
        additionalFiles: [
          this.createMockFile('soc2-certificate.pdf', 'application/pdf', 320000),
        ],
        createdAt: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 3,
        applicationName: 'EduLearn Platform',
        applicationDescription: 'Modern learning management system for schools and universities with interactive content delivery and student progress tracking.',
        logo: this.createMockLogo(3),
        selectedPlans: [1],
        contactPersonName: 'Emily Rodriguez',
        designation: 'Director of Education Technology',
        officialEmail: 'emily.rodriguez@edulearn.edu',
        businessUrl: 'https://www.edulearn.edu',
        registeredBusinessAddress: '789 University Avenue, Building A, Austin, TX 78712',
        licenseNumber: 'EL-2024-003-TX',
        dateOfBirth: '1988-11-30',
        age: 36,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://edulearn.edu/sso/callback'],
        sandboxUrl: 'https://test.edulearn.edu/api',
        isCertified: false,
        comments: 'Pending FERPA compliance review. Target certification date: Q2 2025.',
        additionalFiles: [],
        createdAt: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        id: 4,
        applicationName: 'CloudStore Solutions',
        applicationDescription: 'Scalable e-commerce platform with multi-channel inventory management and automated order fulfillment.',
        logo: this.createMockLogo(4),
        selectedPlans: [2],
        contactPersonName: 'David Kim',
        designation: 'Lead Solutions Architect',
        officialEmail: 'david.kim@cloudstore.com',
        businessUrl: 'https://www.cloudstore.com',
        registeredBusinessAddress: '321 Commerce Drive, Suite 200, Seattle, WA 98101',
        licenseNumber: 'CS-2024-004-WA',
        dateOfBirth: '1992-05-18',
        age: 32,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://cloudstore.com/oauth/redirect', 'https://merchant.cloudstore.com/auth'],
        sandboxUrl: 'https://sandbox.cloudstore.com',
        isCertified: true,
        comments: 'PCI DSS Level 1 compliant for payment processing.',
        additionalFiles: [
          this.createMockFile('pci-compliance.pdf', 'application/pdf', 290000),
          this.createMockFile('api-documentation.pdf', 'application/pdf', 450000),
        ],
        createdAt: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 5,
        applicationName: 'SmartLogistics Network',
        applicationDescription: 'Real-time freight tracking and warehouse management system with predictive analytics and route optimization.',
        logo: this.createMockLogo(5),
        selectedPlans: [3],
        contactPersonName: 'Jennifer Martinez',
        designation: 'VP of Operations',
        officialEmail: 'jennifer.martinez@smartlogistics.net',
        businessUrl: 'https://www.smartlogistics.net',
        registeredBusinessAddress: '555 Industrial Parkway, Building 7, Chicago, IL 60601',
        licenseNumber: 'SL-2024-005-IL',
        dateOfBirth: '1987-09-08',
        age: 37,
        allowedGrant: 'client_credentials',
        redirectUrls: ['https://smartlogistics.net/api/callback'],
        sandboxUrl: 'https://staging.smartlogistics.net/api',
        isCertified: true,
        comments: 'ISO 27001 certified. Handles sensitive shipment data.',
        additionalFiles: [
          this.createMockFile('iso-certificate.pdf', 'application/pdf', 210000),
        ],
        createdAt: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 6,
        applicationName: 'HRManage Suite',
        applicationDescription: 'Comprehensive human resources management system with payroll, benefits administration, and performance tracking.',
        logo: {
          name: 'small-logo.png',
          type: 'image/png',
          size: 2000,
          dataUrl: 'https://via.placeholder.com/50x50/4299e1/ffffff?text=HR' // Example: Small image (50x50px)
        },
        selectedPlans: [1, 2],
        contactPersonName: 'Robert Thompson',
        designation: 'Chief HR Officer',
        officialEmail: 'robert.thompson@hrmanage.io',
        businessUrl: 'https://www.hrmanage.io',
        registeredBusinessAddress: '888 Corporate Center, 15th Floor, Atlanta, GA 30303',
        licenseNumber: 'HR-2024-006-GA',
        dateOfBirth: '1983-12-25',
        age: 41,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://hrmanage.io/sso', 'https://app.hrmanage.io/auth/callback'],
        sandboxUrl: 'https://demo.hrmanage.io/api',
        isCertified: false,
        comments: 'Application under review. Waiting for security clearance.',
        additionalFiles: [
          this.createMockFile('company-registration.pdf', 'application/pdf', 150000),
        ],
        createdAt: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 26 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        id: 7,
        applicationName: 'DataInsights Analytics',
        applicationDescription: 'Advanced business intelligence platform with machine learning capabilities and customizable dashboards.',
        logo: this.createMockLogo(7),
        selectedPlans: [3],
        contactPersonName: 'Lisa Wang',
        designation: 'Data Science Lead',
        officialEmail: 'lisa.wang@datainsights.com',
        businessUrl: 'https://www.datainsights.com',
        registeredBusinessAddress: '100 Tech Plaza, Suite 300, San Francisco, CA 94105',
        licenseNumber: 'DI-2024-007-CA',
        dateOfBirth: '1991-04-14',
        age: 33,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://datainsights.com/auth/callback', 'https://analytics.datainsights.com/oauth'],
        sandboxUrl: 'https://sandbox.datainsights.com',
        isCertified: true,
        comments: 'SOC 2 Type II and GDPR compliant. Approved for enterprise use.',
        additionalFiles: [
          this.createMockFile('gdpr-compliance.pdf', 'application/pdf', 280000),
          this.createMockFile('data-processing-agreement.pdf', 'application/pdf', 190000),
        ],
        createdAt: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 40 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 8,
        applicationName: 'SecureComm Messenger',
        applicationDescription: 'End-to-end encrypted communication platform for businesses with compliance recording and archiving.',
        logo: this.createMockLogo(8),
        selectedPlans: [2],
        contactPersonName: 'Alexander Petrov',
        designation: 'Security Engineer',
        officialEmail: 'alexander.petrov@securecomm.net',
        businessUrl: 'https://www.securecomm.net',
        registeredBusinessAddress: '250 Cyber Street, Building B, Denver, CO 80202',
        licenseNumber: 'SC-2024-008-CO',
        dateOfBirth: '1989-08-03',
        age: 35,
        allowedGrant: 'client_credentials',
        redirectUrls: ['https://securecomm.net/api/auth'],
        sandboxUrl: 'https://test.securecomm.net',
        isCertified: true,
        comments: 'Military-grade encryption. FIPS 140-2 certified.',
        additionalFiles: [
          this.createMockFile('fips-certification.pdf', 'application/pdf', 310000),
          this.createMockFile('penetration-test-results.pdf', 'application/pdf', 220000),
        ],
        createdAt: new Date(baseDate.getTime() + 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 9,
        applicationName: 'PropertyManage Pro',
        applicationDescription: 'Complete property management solution for landlords with tenant screening, lease management, and maintenance tracking.',
        logo: null, // Example: No logo provided
        selectedPlans: [1],
        contactPersonName: 'Maria Gonzalez',
        designation: 'Property Management Director',
        officialEmail: 'maria.gonzalez@propertymanage.com',
        businessUrl: 'https://www.propertymanage.com',
        registeredBusinessAddress: '777 Realty Road, Suite 100, Miami, FL 33131',
        licenseNumber: 'PM-2024-009-FL',
        dateOfBirth: '1986-06-20',
        age: 38,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://propertymanage.com/callback'],
        sandboxUrl: 'https://dev.propertymanage.com',
        isCertified: false,
        comments: 'Application rejected due to incomplete documentation. Resubmission requested.',
        additionalFiles: [],
        createdAt: new Date(baseDate.getTime() + 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 42 * 24 * 60 * 60 * 1000),
        status: 'rejected',
      },
      {
        id: 10,
        applicationName: 'TravelBook Engine',
        applicationDescription: 'Global travel booking platform with hotel, flight, and car rental aggregation from 500+ providers.',
        logo: this.createMockLogo(10),
        selectedPlans: [2, 3],
        contactPersonName: 'Thomas Anderson',
        designation: 'Integration Manager',
        officialEmail: 'thomas.anderson@travelbook.com',
        businessUrl: 'https://www.travelbook.com',
        registeredBusinessAddress: '999 Travel Lane, Suite 450, Las Vegas, NV 89101',
        licenseNumber: 'TB-2024-010-NV',
        dateOfBirth: '1984-10-12',
        age: 40,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://travelbook.com/oauth/return', 'https://api.travelbook.com/callback'],
        sandboxUrl: 'https://sandbox.travelbook.com/v2',
        isCertified: true,
        comments: 'PCI compliant. High-volume API access approved.',
        additionalFiles: [
          this.createMockFile('pci-attestation.pdf', 'application/pdf', 240000),
          this.createMockFile('travel-industry-certification.pdf', 'application/pdf', 175000),
        ],
        createdAt: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 11,
        applicationName: 'FitnessTrack Plus',
        applicationDescription: 'Personal fitness and wellness tracking app with nutrition planning, workout routines, and health metric monitoring.',
        logo: {
          name: 'broken-image.png',
          type: 'image/png',
          size: 5000,
          dataUrl: 'https://invalid-url-that-will-fail.example.com/broken.png' // Example: Broken image URL
        },
        selectedPlans: [1],
        contactPersonName: 'Jessica Brown',
        designation: 'Wellness App Developer',
        officialEmail: 'jessica.brown@fitnesstrack.app',
        businessUrl: 'https://www.fitnesstrack.app',
        registeredBusinessAddress: '444 Health Boulevard, Suite 25, Portland, OR 97201',
        licenseNumber: 'FT-2024-011-OR',
        dateOfBirth: '1993-02-28',
        age: 31,
        allowedGrant: 'authorization_code',
        redirectUrls: ['https://fitnesstrack.app/auth'],
        sandboxUrl: 'https://staging.fitnesstrack.app',
        isCertified: false,
        comments: 'Application suspended pending health data privacy compliance review.',
        additionalFiles: [
          this.createMockFile('privacy-policy.pdf', 'application/pdf', 120000),
        ],
        createdAt: new Date(baseDate.getTime() + 50 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 52 * 24 * 60 * 60 * 1000),
        status: 'suspended',
      },
      {
        id: 12,
        applicationName: 'AutoRepair Hub',
        applicationDescription: 'Automotive service management platform connecting repair shops with customers and parts suppliers.',
        logo: this.createMockLogo(12),
        selectedPlans: [2],
        contactPersonName: 'James Wilson',
        designation: 'Automotive Platform Manager',
        officialEmail: 'james.wilson@autorepair.com',
        businessUrl: 'https://www.autorepair.com',
        registeredBusinessAddress: '123 Motor Avenue, Building C, Detroit, MI 48201',
        licenseNumber: 'AR-2024-012-MI',
        dateOfBirth: '1988-07-17',
        age: 36,
        allowedGrant: 'client_credentials',
        redirectUrls: ['https://autorepair.com/api/oauth'],
        sandboxUrl: 'https://test-api.autorepair.com',
        isCertified: true,
        comments: 'Approved for automotive industry integrations. ASE certified partners.',
        additionalFiles: [
          this.createMockFile('ase-certification.pdf', 'application/pdf', 195000),
        ],
        createdAt: new Date(baseDate.getTime() + 55 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 13,
        applicationName: 'QuickStart App',
        applicationDescription: '', // Example: Empty description
        logo: null, // Example: No logo
        selectedPlans: [1],
        contactPersonName: '', // Example: Missing contact name
        designation: 'Developer',
        officialEmail: 'dev@quickstart.app',
        businessUrl: 'https://www.quickstart.app',
        registeredBusinessAddress: '123 Main St, New York, NY 10001',
        licenseNumber: 'QS-2024-013-NY',
        dateOfBirth: '1995-01-01',
        age: 29,
        allowedGrant: 'client_credentials',
        redirectUrls: ['https://quickstart.app/callback'],
        sandboxUrl: '',
        isCertified: false,
        comments: '',
        additionalFiles: [], // Example: No additional files
        createdAt: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        id: 14,
        applicationName: 'MinimalData Provider',
        applicationDescription: 'Simple app with minimal information.',
        logo: null,
        selectedPlans: [], // Example: No plans selected
        contactPersonName: 'John Doe',
        designation: 'Owner',
        officialEmail: '', // Example: Missing email
        businessUrl: 'https://www.minimal.test',
        registeredBusinessAddress: '999 Test Ave, Boston, MA 02101',
        licenseNumber: 'MD-2024-014-MA',
        dateOfBirth: '1990-05-15',
        age: 34,
        allowedGrant: '', // Example: Missing grant type
        redirectUrls: [],
        sandboxUrl: '',
        isCertified: false,
        comments: '',
        additionalFiles: [],
        createdAt: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ];
  }

  /**
   * Create mock file object
   */
  private createMockFile(name: string, type: string, size: number): ProviderFile {
    return {
      name,
      type,
      size,
      dataUrl: `data:${type};base64,${btoa('mock-file-data')}`,
    };
  }

  /**
   * Create mock logo with placeholder image
   */
  private createMockLogo(seed: number): ProviderFile {
    // Using a variety of avatar styles for different providers
    const styles = ['avataaars', 'bottts', 'identicon', 'initials', 'shapes', 'pixel-art'];
    const style = styles[seed % styles.length];
    const imageUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=provider${seed}`;

    return {
      name: `provider-${seed}-logo.svg`,
      type: 'image/svg+xml',
      size: 15000,
      dataUrl: imageUrl,
    };
  }
}

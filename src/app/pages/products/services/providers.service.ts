import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { faker } from '@faker-js/faker';
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
    faker.seed(42);

    const statuses: Provider['status'][] = ['pending', 'approved', 'rejected', 'active', 'suspended'];
    const grants = ['authorization_code', 'client_credentials', 'implicit'];

    return Array.from({ length: 14 }, (_, i) => {
      const id = i + 1;
      const companyName = faker.company.name();
      const appSuffix = faker.helpers.arrayElement(['API', 'Platform', 'Pro', 'Suite', 'Hub', 'Engine', 'Network', 'Solutions']);
      const domain = faker.internet.domainName();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const dob = faker.date.birthdate({ min: 25, max: 55, mode: 'age' });
      const createdAt = faker.date.between({ from: '2024-01-01', to: '2024-06-30' });
      const updatedAt = faker.date.between({ from: createdAt, to: '2024-12-31' });

      const fileCount = faker.number.int({ min: 0, max: 3 });
      const additionalFiles: ProviderFile[] = Array.from({ length: fileCount }, () =>
        this.createMockFile(
          `${faker.system.commonFileName('pdf')}`,
          'application/pdf',
          faker.number.int({ min: 100000, max: 500000 }),
        ),
      );

      const redirectCount = faker.number.int({ min: 1, max: 3 });

      return {
        id,
        applicationName: `${companyName} ${appSuffix}`,
        applicationDescription: faker.company.catchPhrase() + '. ' + faker.lorem.sentence(),
        logo: faker.datatype.boolean(0.8) ? this.createMockLogo(id) : null,
        selectedPlans: faker.helpers.arrayElements([1, 2, 3], { min: 0, max: 3 }),
        contactPersonName: `${firstName} ${lastName}`,
        designation: faker.person.jobTitle(),
        officialEmail: faker.internet.email({ firstName, lastName, provider: domain }),
        businessUrl: `https://www.${domain}`,
        registeredBusinessAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state({ abbreviated: true })} ${faker.location.zipCode()}`,
        licenseNumber: `${faker.string.alpha({ length: 2, casing: 'upper' })}-2024-${String(id).padStart(3, '0')}-${faker.location.state({ abbreviated: true })}`,
        dateOfBirth: dob.toISOString().split('T')[0],
        age: new Date().getFullYear() - dob.getFullYear(),
        allowedGrant: faker.helpers.arrayElement(grants),
        redirectUrls: Array.from({ length: redirectCount }, () =>
          `https://${faker.internet.domainName()}/oauth/callback`,
        ),
        sandboxUrl: faker.datatype.boolean(0.8) ? `https://sandbox.${domain}/api` : '',
        isCertified: faker.datatype.boolean(),
        comments: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : '',
        additionalFiles,
        createdAt,
        updatedAt,
        status: faker.helpers.arrayElement(statuses),
      };
    });
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

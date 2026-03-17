import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Credential, CreateCredentialDto } from '../entities/credential.entity';

@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private credentials: Credential[] = this.generateMockCredentials();

  /**
   * Get credentials for a provider
   */
  getCredentialsByProviderId(providerId: number): Observable<Credential[]> {
    const providerCredentials = this.credentials.filter((c) => c.providerId === providerId);
    return of(providerCredentials).pipe(delay(500));
  }

  /**
   * Get credential by ID
   */
  getCredentialById(id: number): Observable<Credential | undefined> {
    const credential = this.credentials.find((c) => c.id === id);
    return of(credential).pipe(delay(300));
  }

  /**
   * Create new credential for a single provider
   */
  createCredential(providerId: number, dto: CreateCredentialDto): Observable<Credential> {
    // Generate a default name based on timestamp and random suffix
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const defaultName = `Credential_${timestamp}_${randomSuffix}`;

    // Default to sandbox environment
    const environment: 'sandbox' | 'production' = 'sandbox';

    const newCredential: Credential = {
      id: Math.max(...this.credentials.map((c) => c.id), 0) + 1,
      providerId: providerId,
      clientId: this.generateClientId(),
      clientSecret: this.generateClientSecret(),
      name: defaultName,
      description: dto.description,
      environment: environment,
      isActive: true,
      createdAt: new Date(),
    };
    this.credentials.push(newCredential);
    return of(newCredential).pipe(delay(800));
  }

  /**
   * Regenerate client secret
   */
  regenerateSecret(id: number): Observable<Credential> {
    const index = this.credentials.findIndex((c) => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Credential not found'));
    }
    this.credentials[index] = {
      ...this.credentials[index],
      clientSecret: this.generateClientSecret(),
    };
    return of(this.credentials[index]).pipe(delay(800));
  }

  /**
   * Toggle credential active status
   */
  toggleActive(id: number): Observable<Credential> {
    const index = this.credentials.findIndex((c) => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Credential not found'));
    }
    this.credentials[index] = {
      ...this.credentials[index],
      isActive: !this.credentials[index].isActive,
    };
    return of(this.credentials[index]).pipe(delay(500));
  }

  /**
   * Delete credential
   */
  deleteCredential(id: number): Observable<boolean> {
    const index = this.credentials.findIndex((c) => c.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.credentials.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  /**
   * Generate mock credentials
   */
  private generateMockCredentials(): Credential[] {
    return [
      {
        id: 1,
        providerId: 1,
        clientId: 'hc_live_pk_a1b2c3d4e5f6g7h8',
        clientSecret: 'hc_live_sk_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6',
        name: 'Production API Key',
        description: 'Main production credentials for HealthConnect API',
        environment: 'production',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        lastUsedAt: new Date('2024-03-10'),
      },
      {
        id: 2,
        providerId: 1,
        clientId: 'hc_test_pk_m6n7o8p9q0r1s2t3',
        clientSecret: 'hc_test_sk_n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1',
        name: 'Sandbox Testing Key',
        description: 'Development and testing credentials',
        environment: 'sandbox',
        isActive: true,
        createdAt: new Date('2024-01-20'),
        lastUsedAt: new Date('2024-03-14'),
      },
      {
        id: 3,
        providerId: 2,
        clientId: 'fh_live_pk_u4v5w6x7y8z9a0b1',
        clientSecret: 'fh_live_sk_d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6',
        name: 'Production Credentials',
        description: 'FinanceHub production environment',
        environment: 'production',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        lastUsedAt: new Date('2024-03-15'),
      },
    ];
  }

  /**
   * Generate random client ID
   */
  private generateClientId(): string {
    const prefix = 'cli';
    const env = Math.random() > 0.5 ? 'live' : 'test';
    const random = this.generateRandomString(24);
    return `${prefix}_${env}_pk_${random}`;
  }

  /**
   * Generate random client secret
   */
  private generateClientSecret(): string {
    const prefix = 'sec';
    const env = Math.random() > 0.5 ? 'live' : 'test';
    const random = this.generateRandomString(32);
    return `${prefix}_${env}_sk_${random}`;
  }

  /**
   * Generate random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

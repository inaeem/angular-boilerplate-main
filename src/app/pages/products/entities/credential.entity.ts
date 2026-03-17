export interface Credential {
  id: number;
  providerId: number;
  clientId: string;
  clientSecret: string;
  name: string;
  description?: string;
  environment: 'sandbox' | 'production';
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

export interface CreateCredentialDto {
  providerIds: number[];
  description?: string;
}

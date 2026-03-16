import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CredentialsService } from '../services/credentials.service';
import { ProvidersService } from '../services/providers.service';
import { Credential, CreateCredentialDto } from '../entities/credential.entity';
import { Provider } from '../entities/provider.entity';
import { ToastService } from '@shared/services/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-credentials',
  standalone: false,
  templateUrl: './credentials.component.html',
  styleUrl: './credentials.component.scss',
})
export class CredentialsComponent implements OnInit {
  credentials: Credential[] = [];
  provider: Provider | null = null;
  providerId: number | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';

  // Modal state
  showCreateModal = false;
  showDeleteModal = false;
  credentialToDelete: Credential | null = null;
  showSecretModal = false;
  revealedSecret: string = '';

  // Form data
  formData: CreateCredentialDto = {
    name: '',
    description: '',
    environment: 'sandbox',
  };

  // Copy states
  copiedStates: { [key: number]: { clientId: boolean; clientSecret: boolean } } = {};

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _credentialsService: CredentialsService,
    private readonly _providersService: ProvidersService,
    private readonly _toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.providerId = parseInt(id, 10);
      this.loadProvider(this.providerId);
      this.loadCredentials(this.providerId);
    } else {
      this._router.navigate(['/products']);
    }
  }

  loadProvider(id: number): void {
    this._providersService
      .getProviderById(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (provider) => {
          if (provider) {
            this.provider = provider;
          }
        },
        error: (error) => {
          console.error('Error loading provider:', error);
        },
      });
  }

  loadCredentials(providerId: number): void {
    this.isLoading = true;
    this.hasError = false;
    this._credentialsService
      .getCredentialsByProviderId(providerId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (credentials) => {
          this.credentials = credentials;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading credentials:', error);
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = 'Failed to load credentials. Please try again later.';
        },
      });
  }

  openCreateModal(): void {
    this.formData = {
      name: '',
      description: '',
      environment: 'sandbox',
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createCredential(): void {
    if (!this.providerId || !this.formData.name.trim()) {
      this._toastService.error('Validation Error', 'Please provide a name for the credential');
      return;
    }

    this._credentialsService
      .createCredential(this.providerId, this.formData)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (credential) => {
          this.credentials.push(credential);
          this._toastService.success('Credential Created', 'New credentials have been generated successfully');
          this.closeCreateModal();
          this.revealedSecret = credential.clientSecret;
          this.showSecretModal = true;
        },
        error: (error) => {
          console.error('Error creating credential:', error);
          this._toastService.error('Creation Failed', 'Failed to create credential. Please try again.');
        },
      });
  }

  regenerateSecret(credential: Credential): void {
    if (!confirm(`Are you sure you want to regenerate the secret for "${credential.name}"? The old secret will no longer work.`)) {
      return;
    }

    this._credentialsService
      .regenerateSecret(credential.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (updated) => {
          const index = this.credentials.findIndex((c) => c.id === updated.id);
          if (index > -1) {
            this.credentials[index] = updated;
          }
          this._toastService.success('Secret Regenerated', 'A new client secret has been generated');
          this.revealedSecret = updated.clientSecret;
          this.showSecretModal = true;
        },
        error: (error) => {
          console.error('Error regenerating secret:', error);
          this._toastService.error('Regeneration Failed', 'Failed to regenerate secret. Please try again.');
        },
      });
  }

  toggleActive(credential: Credential): void {
    this._credentialsService
      .toggleActive(credential.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (updated) => {
          const index = this.credentials.findIndex((c) => c.id === updated.id);
          if (index > -1) {
            this.credentials[index] = updated;
          }
          const status = updated.isActive ? 'activated' : 'deactivated';
          this._toastService.success('Status Updated', `Credential has been ${status}`);
        },
        error: (error) => {
          console.error('Error toggling status:', error);
          this._toastService.error('Update Failed', 'Failed to update credential status');
        },
      });
  }

  openDeleteModal(credential: Credential): void {
    this.credentialToDelete = credential;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.credentialToDelete = null;
  }

  confirmDelete(): void {
    if (!this.credentialToDelete) return;

    const credentialName = this.credentialToDelete.name;
    this._credentialsService
      .deleteCredential(this.credentialToDelete.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (success) => {
          if (success) {
            this.credentials = this.credentials.filter((c) => c.id !== this.credentialToDelete!.id);
            this._toastService.success('Credential Deleted', `"${credentialName}" has been deleted successfully`);
            this.closeDeleteModal();
          }
        },
        error: (error) => {
          console.error('Error deleting credential:', error);
          this._toastService.error('Delete Failed', 'Failed to delete credential. Please try again.');
          this.closeDeleteModal();
        },
      });
  }

  copyToClipboard(text: string, type: 'clientId' | 'clientSecret', credentialId: number): void {
    navigator.clipboard.writeText(text).then(
      () => {
        if (!this.copiedStates[credentialId]) {
          this.copiedStates[credentialId] = { clientId: false, clientSecret: false };
        }
        this.copiedStates[credentialId][type] = true;
        this._toastService.success('Copied', `${type === 'clientId' ? 'Client ID' : 'Client Secret'} copied to clipboard`);

        setTimeout(() => {
          if (this.copiedStates[credentialId]) {
            this.copiedStates[credentialId][type] = false;
          }
        }, 2000);
      },
      () => {
        this._toastService.error('Copy Failed', 'Failed to copy to clipboard');
      }
    );
  }

  closeSecretModal(): void {
    this.showSecretModal = false;
    this.revealedSecret = '';
  }

  goBack(): void {
    if (this.providerId) {
      this._router.navigate(['/products/view', this.providerId]);
    } else {
      this._router.navigate(['/products']);
    }
  }

  maskSecret(secret: string): string {
    if (secret.length <= 8) return '••••••••';
    return secret.substring(0, 12) + '••••••••••••••••••••••••';
  }
}

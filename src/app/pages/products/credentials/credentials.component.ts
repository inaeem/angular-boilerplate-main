import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
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
  availableProviders: Provider[] = [];
  filteredProviders: Provider[] = [];
  isLoadingProviders = false;
  showValidationError = false;
  searchLOB = '';

  // Modal state
  showCreateModal = false;
  showDeleteModal = false;
  credentialToDelete: Credential | null = null;
  isCreatingCredentials = false;

  // Form data
  formData: CreateCredentialDto = {
    providerIds: [],
    description: '',
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
    // Load all providers for the dropdown
    this.loadAllProviders();

    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.providerId = parseInt(id, 10);
      this.loadProvider(this.providerId);
      this.loadCredentials(this.providerId);
    } else {
      this._router.navigate(['/products']);
    }
  }

  loadAllProviders(): void {
    this.isLoadingProviders = true;
    this._providersService
      .getProviders()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (providers) => {
          this.availableProviders = providers;
          this.filteredProviders = providers;
          this.isLoadingProviders = false;
        },
        error: (error) => {
          console.error('Error loading providers:', error);
          this.isLoadingProviders = false;
        },
      });
  }

  filterProviders(): void {
    const search = this.searchLOB.toLowerCase().trim();
    if (!search) {
      this.filteredProviders = this.availableProviders;
    } else {
      this.filteredProviders = this.availableProviders.filter(provider =>
        provider.applicationName.toLowerCase().includes(search) ||
        (provider.status && provider.status.toLowerCase().includes(search))
      );
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
      providerIds: [],
      description: '',
    };
    this.showValidationError = false;
    this.searchLOB = '';
    this.filteredProviders = this.availableProviders;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createCredential(): void {
    if (this.formData.providerIds.length === 0) {
      this.showValidationError = true;
      this._toastService.error('Validation Error', 'Please select at least one line of business');
      return;
    }

    this.showValidationError = false;

    // Create credentials for each selected provider
    const creationObservables = this.formData.providerIds.map(providerId =>
      this._credentialsService.createCredential(providerId, this.formData)
    );

    // Execute all creation requests with loading state
    this.isCreatingCredentials = true;
    forkJoin(creationObservables)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (credentials) => {
          credentials.forEach(credential => {
            this.credentials.push(credential);
          });
          this.isCreatingCredentials = false;
          this.closeCreateModal();
          this._toastService.success(
            'Credentials Created',
            `${credentials.length} credential${credentials.length > 1 ? 's have' : ' has'} been generated successfully`
          );
        },
        error: (error) => {
          console.error('Error creating credentials:', error);
          this.isCreatingCredentials = false;
          this._toastService.error('Creation Failed', 'Failed to create credentials. Please try again.');
        },
      });
  }

  getProviderName(providerId: number): string {
    const provider = this.availableProviders.find(p => p.id === providerId);
    return provider ? provider.applicationName : `Provider ${providerId}`;
  }

  // Provider selection methods
  toggleProvider(providerId: number): void {
    const index = this.formData.providerIds.indexOf(providerId);
    if (index > -1) {
      this.formData.providerIds.splice(index, 1);
    } else {
      this.formData.providerIds.push(providerId);
    }
    this.showValidationError = false;
  }

  isProviderSelected(providerId: number): boolean {
    return this.formData.providerIds.includes(providerId);
  }

  toggleAllProviders(): void {
    if (this.areAllProvidersSelected()) {
      this.formData.providerIds = [];
    } else {
      this.formData.providerIds = this.availableProviders.map(p => p.id);
    }
    this.showValidationError = false;
  }

  areAllProvidersSelected(): boolean {
    return this.availableProviders.length > 0 &&
           this.formData.providerIds.length === this.availableProviders.length;
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
          this._toastService.success('Secret Regenerated', 'A new client secret has been generated. You can now copy it from the credential card.');
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

import { ApplicationConfig, enableProdMode, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withPreloading, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { ShellModule } from './shell/shell.module';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiPrefixInterceptor, ErrorHandlerInterceptor } from '@core/interceptors';
import { RouteReusableStrategy } from '@core/helpers';
import { provideServiceWorker } from '@angular/service-worker';
import { SocketIoModule } from '@core/socket-io';

if (environment.production) {
  enableProdMode();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection is required for Angular's zone.js
    provideZoneChangeDetection({ eventCoalescing: true }),

    // import providers from other modules (e.g. TranslateModule, ShellModule, socketModule), which follow the older pattern to import modules
    importProvidersFrom(
      TranslateModule.forRoot(),
      ShellModule,
      SocketIoModule.forRoot({
        rootUrl: null, // TODO: provide your own socket.io server URL
        options: {
          transports: ['websocket'],
        },
      }),
    ),

    // provideServiceWorker is required for Angular's service workers
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      scope: '/',
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // provideRouter is required for Angular's router with additional configuration
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always',
      }),
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withPreloading(PreloadAllModules),
    ),

    // provideHttpClient is required for Angular's HttpClient with additional configuration, which includes interceptors from DI (dependency injection) , means to use class based interceptors
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiPrefixInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true,
    },
    {
      provide: RouteReuseStrategy,
      useClass: RouteReusableStrategy,
    },

    // OAuth2 / OIDC client. Sends bearer tokens to the configured resource server URLs.
    provideOAuthClient({
      resourceServer: {
        allowedUrls: [environment.apiBaseUrl],
        sendAccessToken: true,
      },
    }),

    // Persist tokens in sessionStorage (cleared when the tab closes).
    { provide: OAuthStorage, useFactory: () => sessionStorage },

    // Load discovery doc + process the IdP redirect callback before any route activates.
    provideAppInitializer(() => inject(AuthenticationService).runInitialLoginSequence()),
  ],
};

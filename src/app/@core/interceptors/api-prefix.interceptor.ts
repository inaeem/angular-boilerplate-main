import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, Subject, takeUntil, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { CredentialsService } from '@auth';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiPrefixInterceptor implements HttpInterceptor {
  private readonly _ongoingRequests = new Map<string, Subject<any>>();
  private _isRefreshing = false;

  constructor(
    private readonly _credentialsService: CredentialsService,
    private readonly _translateService: TranslateService,
    private readonly _oauthService: OAuthService,
    private readonly _router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If the request has the 'noauth' header, don't add the Authorization header
    if (request.headers.get('noauth')) {
      return next.handle(request);
    }

    // Skip adding auth header for OAuth2 discovery document and token endpoint requests
    if (this._isOAuthRequest(request.url)) {
      return next.handle(request);
    }

    let headers = request.headers;
    const currentLang = this._translateService.currentLang.substring(0, 2);

    // Get access token from OAuthService
    const accessToken = this._oauthService.getAccessToken();

    if (accessToken) {
      if (!(request.body instanceof FormData)) {
        headers = headers.set('content-type', 'application/json');
      }
      headers = headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // Set language headers
    headers = headers.set('Accept-Language', currentLang).set('Content-Language', currentLang).set('lang', currentLang);

    request = request.clone({ headers });

    /**
     * In below piece of code If there is an ongoing request with the same method and URL than return the ongoing request instead of creating a new one
     * This is useful when the user clicks multiple times on a button that triggers a request
     */

    const requestKey = this._getRequestKey(request);

    const ongoingRequest = this._ongoingRequests.get(requestKey);
    if (ongoingRequest) {
      return ongoingRequest.asObservable();
    } else {
      const cancelSubject = new Subject<any>();
      this._ongoingRequests.set(requestKey, cancelSubject);

      return next.handle(request).pipe(
        takeUntil(cancelSubject),
        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized errors
          if (error.status === 401) {
            return this._handle401Error(request, next, cancelSubject);
          }

          // Handle 403 Forbidden errors
          if (error.status === 403) {
            console.error('Access forbidden (403)');
            // Optionally redirect to an error page or show a message
          }

          return throwError(() => error);
        }),
        finalize(() => {
          this._ongoingRequests.delete(requestKey);
          cancelSubject.complete();
        }),
      );
    }
  }

  /**
   * Handles 401 Unauthorized errors by attempting to refresh the token.
   * If refresh fails, redirects to login page.
   */
  private _handle401Error(request: HttpRequest<any>, next: HttpHandler, cancelSubject: Subject<any>): Observable<HttpEvent<any>> {
    if (!this._isRefreshing) {
      this._isRefreshing = true;

      // Try to refresh the token
      return new Observable((observer) => {
        this._oauthService
          .refreshToken()
          .then(() => {
            this._isRefreshing = false;
            const newAccessToken = this._oauthService.getAccessToken();

            if (newAccessToken) {
              // Retry the request with the new token
              const clonedRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });

              next.handle(clonedRequest).subscribe({
                next: (value) => observer.next(value),
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
              });
            } else {
              this._redirectToLogin();
              observer.error(new Error('Token refresh failed'));
            }
          })
          .catch((error) => {
            this._isRefreshing = false;
            console.error('Token refresh failed:', error);
            this._redirectToLogin();
            observer.error(error);
          });
      });
    } else {
      // If already refreshing, wait and retry
      return throwError(() => new Error('Token refresh in progress'));
    }
  }

  /**
   * Redirects to the login page and clears credentials.
   */
  private _redirectToLogin(): void {
    this._credentialsService.setCredentials();
    this._oauthService.logOut();
    this._router.navigate(['/login']);
  }

  /**
   * Checks if the request is for OAuth2 endpoints (discovery document, token endpoint).
   * These requests should not have the Authorization header added.
   */
  private _isOAuthRequest(url: string): boolean {
    return (
      url.includes('/.well-known/openid-configuration') ||
      url.includes('/token') ||
      url.includes('/authorize') ||
      url.includes('/jwks') ||
      url.includes('/userinfo') ||
      url.includes('/revoke')
    );
  }

  private _getRequestKey(req: HttpRequest<any>): string {
    return `${req.method} ${req.urlWithParams}`;
  }
}

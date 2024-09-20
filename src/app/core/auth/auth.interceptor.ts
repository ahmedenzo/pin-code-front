import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';

import { AuthUtils } from './auth.utils';
import { catchError, Observable, throwError, switchMap } from 'rxjs';


export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Clone the request object
    let newReq = req.clone();

    // Add Authorization header if access token is valid
    const accessToken = authService.accessToken;
    if (accessToken) {
        newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + accessToken),
        });
    }

    // Handle the response
    return next(newReq).pipe(
        catchError((error) => {
            // Check if it's a "401 Unauthorized" response
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // First check if the refresh token is also expired
                const refreshToken = authService.refreshToken;
                if (!refreshToken || AuthUtils.isTokenExpired(refreshToken)) {
                    // If refresh token is expired, trigger sign-out
                    authService.signOut().pipe(
                        catchError((err) => {
                            console.error('Error during sign-out: ', err);
                            return throwError(err);
                        })
                    ).subscribe(() => {
                        // Handle navigation after sign-out
                        if (router.url === '/auth/sign-in') {
                            // Show alert if already on the sign-in page
                            authService.triggerAlert('Session expired. Please sign in again.');
                        } else {
                            // Navigate to the sign-in page
                            router.navigate(['/auth/sign-in']);
                        }
                    });
                } else {
                    // If refresh token is still valid, attempt to refresh the access token
                    return authService.refreshAccessToken().pipe(
                        catchError((refreshError) => {
                            // If refreshing the access token fails, sign out
                            console.error('Error refreshing access token:', refreshError);
                            return authService.signOut().pipe(
                                catchError((err) => {
                                    console.error('Error during sign-out after refresh failure: ', err);
                                    return throwError(err);
                                })
                            );
                        }),
                        // Retry the original request with the new token
                        switchMap(() => {
                            const newAccessToken = authService.accessToken;
                            const clonedRequest = req.clone({
                                headers: req.headers.set('Authorization', 'Bearer ' + newAccessToken)
                            });
                            return next(clonedRequest);
                        })
                    );
                }
            }

            // Re-throw the error so other parts of the app can handle it
            return throwError(error);
        })
    );
};

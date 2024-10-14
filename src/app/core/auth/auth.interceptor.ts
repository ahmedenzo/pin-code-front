import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { AuthUtils } from './auth.utils';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);


    let newReq = req.clone({
        withCredentials: true
    });

 
    if ( authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken) )
        {
            newReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
            });
        }


    return next(newReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Handle 401 by attempting token refresh
                return authService.refreshAccessToken().pipe(
                    switchMap(() => {
                        const newAccessToken = authService.accessToken;
                        const clonedReq = req.clone({
                            headers: req.headers.set('Authorization', `Bearer ${newAccessToken}`)
                        });
                        return next(clonedReq);
                    }),
                    catchError(refreshError => {
                        console.error('Error refreshing token, logging out', refreshError);
                        authService.signOut();
                        return throwError(refreshError);
                    })
                );
            }

            return throwError(error);
        })
    );
};

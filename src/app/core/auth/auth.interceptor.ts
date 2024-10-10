import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, Observable, throwError, switchMap } from 'rxjs';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    let newReq = req.clone({
        withCredentials: true
    });

    const accessToken = authService.accessToken;
    
    //console.log('Interceptor access token:', accessToken);

    if (accessToken) {
        newReq = newReq.clone({
            headers: newReq.headers.set('Authorization', 'Bearer ' + accessToken),
            withCredentials: true
        });
    }

    return next(newReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                return authService.refreshAccessToken().pipe(
                    switchMap(() => {
                        const newAccessToken = authService.accessToken;
                        const clonedRequest = newReq.clone({
                            headers: newReq.headers.set('Authorization', 'Bearer ' + newAccessToken),
                            withCredentials: true
                        });
                        return next(clonedRequest);
                    }),
                    catchError((refreshError: HttpErrorResponse) => {
                        console.error('Error refreshing access token:', refreshError);
                        authService.signOut().subscribe(() => {
                            router.navigate(['/auth/sign-in']);
                        });
                        return throwError(refreshError);
                    })
                );
            }
            return throwError(error);
        })
    );
};

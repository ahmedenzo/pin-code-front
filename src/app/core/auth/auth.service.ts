import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';

import { environment } from '../../../../environment.prod';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _tokenService = inject(TokenService);
    private _CookieService = inject(CookieService);
    private _userService = inject(UserService);
    private apiUrl = environment.apiUrl;
    private _alertSubject = new BehaviorSubject<string | null>(null);
 
    public alert$ = this._alertSubject.asObservable();

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        this._tokenService.setToken(token);  // Corrected to use the passed token instead of a hardcoded value
    }

    /**
     * Getter for access token
     */
    get accessToken(): string {
        return this._tokenService.getToken() ?? '';  // Returns the decrypted token or an empty string if not available
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

 

    /**
     * Trigger an alert to display to the user
     * @param message
     */
    triggerAlert(message: string): void {
        this._alertSubject.next(message);
    }

    /**
     * Sign in
     *
     * @param credentials { username, password }
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError(() => new Error('User is already logged in.'));
        }
    
        return this._httpClient.post(`${this.apiUrl}/api/auth/signin`, credentials, { withCredentials: true }).pipe(
            switchMap((response: any) => {
                const token = response.token; 
                const refreshToken = response.refreshToken;
    
                if (!token) {
                    return throwError(() => new Error('Access token is missing from the response.'));
                }
    
                this.accessToken = token;             
                this._authenticated = true;
    
                const userData = {
                    id: response.id,
                    username: response.username,
                    roles: response.roles,
                    sessionId: response.sessionId,
                    adminId: response.adminId, // Make sure this is set
                    bankId: response.bankId,    // Make sure this is set
                    agencyId: response.agencyId   // Make sure this is set
                };
                this._userService.user = userData; // Set the user data in UserService
                this._CookieService.setCookie('userData', JSON.stringify(userData), 7); // Set cookie
    
                return of(response);
            }),
            catchError((error) => {
                console.error('Error during sign-in:', error);
                this.triggerAlert('Wrong username or password. Please try again.');
                this._authenticated = false;
                return throwError(error);
            })
        );
    }
    
    
    

    /**
     * Sign out
     */
/**
 * Sign out
 */
signOut(): Observable<any> {
  

    const accessToken = this.accessToken;


    const headers = new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`
    });

    return this._httpClient.post(`${this.apiUrl}/api/auth/signout`, {}, { headers, withCredentials: true }).pipe(
        tap(() => {
            console.log('API sign-out success');
            this._clearSession(); 
        }),
        catchError((error) => {
            console.error('Error during sign-out: ', error);
            this._clearSession(); 
            return throwError(error);
        }),
   
    );
}



private _clearSession(): void {
    this._tokenService.removeToken();  // Remove token from storage
    this._CookieService.deleteCookie('userData');  // Remove user data cookie
    this._authenticated = false;  // Set authenticated to false

}






    /**
     * Check the authentication status
     */
  check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
       
    }

    /**
     * Refresh the access token using the refresh token stored in cookies
     */
  // Updated refreshAccessToken method to ensure consistency
  /**
 * Refresh the access token using the refresh token stored in cookies
 */
  refreshAccessToken(): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/api/auth/refreshToken`, {}, { withCredentials: true }).pipe(
        switchMap((response: any) => {
            const newAccessToken = response.accessToken;

            if (!newAccessToken) {
                return throwError(() => new Error('Invalid token response.'));
            }

            // Set new access token
            this.accessToken = newAccessToken;

            return of(response);
        }),
        catchError((error: HttpErrorResponse) => {
            console.error('Error during token refresh:', error);
            this.signOut().subscribe();
            return throwError(error);
        })
    );
}







    /**
     * Handle unauthorized errors (e.g., invalid or expired tokens)
     */
  

    /**
     * Forgot password
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign up
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     * @param credentials
     */
    unlockSession(credentials: { username: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }
}
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, switchMap, tap, throwError,filter,take } from 'rxjs';
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
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null); // Shared token

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        this._tokenService.setToken(token);  // Save the token securely using TokenService
    }

    /**
     * Getter for access token
     */
    get accessToken(): string {
        return this._tokenService.getToken() ?? '';  // Retrieve the token from TokenService
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

                if (!token || !refreshToken) {
                    return throwError(() => new Error('Access or refresh token is missing from the response.'));
                }

                // Save the access token and refresh token
                this.accessToken = token;             
                this._authenticated = true;

                const userData = {
                    id: response.id,
                    username: response.username,
                    roles: response.roles,
                    sessionId: response.sessionId,
                    adminId: response.adminId,
                    bankId: response.bankId,
                    agencyId: response.agencyId
                };
                
                this._userService.user = userData; // Set the user data in UserService
                this._CookieService.setCookie('userData', JSON.stringify(userData), 7); // Set cookie for user data
                
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
    // Retrieve the user data from the cookie
    const userDataCookie = this._CookieService.getCookie('userData');
    
    // Parse the userData from the cookie to get the sessionId
    const userData = userDataCookie ? JSON.parse(userDataCookie) : null;
    
    if (!userData || !userData.sessionId) {
        console.error('No sessionId found in userData');
        return throwError(() => new Error('Session ID not found.'));
    }

    // Send only the sessionId in the sign-out request
    const sessionId = userData.sessionId;
    
    return this._httpClient.post(`${this.apiUrl}/api/auth/signout`, { sessionId }, { withCredentials: true }).pipe(
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


    /**
     * Clear session data
     */
    private _clearSession(): void {
        this._tokenService.removeToken();  // Remove token from storage
        this._CookieService.deleteCookie('userData');  // Remove user data cookie
        this._authenticated = false;  // Set authenticated to false
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability and expiration
        if (!this.accessToken || AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and isn't expired, assume user is authenticated
        return of(true);
    }

    /**
     * Refresh the access token using the refresh token stored in cookies
     */
    refreshAccessToken(): Observable<any> {
        if (this.isRefreshing) {
            // If refresh is already in progress, return the subject as an observable
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),  // Proceed only when we have a new token
                take(1),  // Complete after taking the next emitted token value
                switchMap(() => of(this.accessToken))  // Return the latest access token
            );
        } else {
            // Mark that the refresh process is in progress
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);  // Reset the subject to indicate refreshing

            return this._httpClient.post(`${this.apiUrl}/api/auth/refreshToken`, {}, { withCredentials: true }).pipe(
                switchMap((response: any) => {
                    const newAccessToken = response.accessToken;

                    if (!newAccessToken) {
                        return throwError(() => new Error('Invalid token response.'));
                    }

                    // Save the new access token
                    this.accessToken = newAccessToken;

                    // Broadcast the new access token to all subscribers
                    this.refreshTokenSubject.next(newAccessToken);
                    this.isRefreshing = false;

                    // Log for debugging purposes
          

                    return of(newAccessToken);  // Return the new access token
                }),
                catchError((error: HttpErrorResponse) => {
                    console.error('Error during token refresh:', error);
                    this.signOut().subscribe();  // Sign out if token refresh fails
                    this.isRefreshing = false;
                    return throwError(error);
                })
            );
        }
    }
    

    /**
     * Forgot password
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/api/auth/forgot-password`, email);
    }

    /**
     * Reset password
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/api/auth/reset-password`, password);
    }

    /**
     * Sign up
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/api/auth/sign-up`, user);
    }

    /**
     * Unlock session
     * @param credentials
     */
    unlockSession(credentials: { username: string; password: string }): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/api/auth/unlock-session`, credentials);
    }
}

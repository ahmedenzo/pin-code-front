import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { BehaviorSubject, catchError, Observable, of, switchMap, throwError,tap,map } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService
{
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private apiUrl = 'http://localhost:8080';
    private _alertSubject = new BehaviorSubject<string | null>(null);
    
    public alert$ = this._alertSubject.asObservable(); 
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }
    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials { username, password }
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(`${this.apiUrl}/api/auth/signin`, credentials).pipe(
            switchMap((response: any) => {
              

                // Store the access token and refresh token
                this.accessToken = response.token;
                this.refreshToken = response.refreshToken;

                // Ensure the token is present
                if (!this.accessToken) {
                    return throwError('Access token is missing from the response.');
                }

                // Set authenticated flag
                this._authenticated = true;

                // Store user details in the user service (if needed)
                this._userService.user = response;
                console.log('Stored user details in UserService:', response);
                window.location.reload(); 

                return of(response);
            }),
            catchError((error) => {
                console.error('Error during sign-in:', error);

                // Set an alert message
                this.triggerAlert('Wrong username or password. Please try again.');

                this._authenticated = false;
                return throwError(error);
            })
        );
    }

    /**
     * Trigger an alert to display to the user
     * @param message
     */
    triggerAlert(message: string): void {
        this._alertSubject.next(message);  // Emit the alert message
    }

    
    check(): Observable<boolean> {
        // Check if the user is already authenticated
        if (this._authenticated) {
            console.log('User is already authenticated.');
            return of(true);
        }
    
        // Check if the access token exists and is not expired
        if (!this.accessToken || AuthUtils.isTokenExpired(this.accessToken)) {
            console.log('Access token is missing or expired.');
    
            // If a refresh token exists, attempt to refresh the access token
            if (this.refreshToken) {
                console.log('Attempting to refresh the access token using the refresh token.');
                return this.refreshAccessToken().pipe(
                    map(() => {
                        console.log('Access token refreshed successfully.');
                        return true;
                    }),
                    catchError((error) => {
                        console.error('Failed to refresh access token:', error);
    
                        // Handle the case when the refresh token is invalid
                        if (error.includes('Refresh token is not valid')) {
                            console.warn('User needs to log in again.');
                            // Perform any necessary cleanup or redirect here
                            this.signOut(); // Example action to log out
                        }
    
                        return of(false);
                    })
                );
            } else {
                console.warn('No refresh token available.');
                return of(false);
            }
        }
    
        // Access token is valid and not expired
        console.log('Access token is valid.');
        return of(true);
    }
    
    
    /**
     * Refresh the access token using the refresh token
     */
    refreshAccessToken(): Observable<any> {
        if (!this.refreshToken) {
            console.warn('No refresh token available.');
            return throwError('No refresh token available.');
        }
    
        console.log('Sending refresh token request to the server...');
    
        return this._httpClient.post(`${this.apiUrl}/api/auth/refreshToken`, {
            refreshToken: this.refreshToken
        }).pipe(
            switchMap((response: any) => {
                // Log the full response to ensure it contains the tokens
                console.log('Refresh token response received:', response);
    
                // Check if the response contains a new access token and refresh token
                if (response.accessToken && response.refreshToken) {
                    console.log('New access token received:', response.accessToken);
                    console.log('New refresh token received:', response.refreshToken);
                    
                    // Store the new access token and refresh token
                    this.accessToken = response.accessToken;
                    this.refreshToken = response.refreshToken;
    
                    // Store them in localStorage
                    localStorage.setItem('accessToken', this.accessToken);
                    localStorage.setItem('refreshToken', this.refreshToken);
                } else {
                    console.warn('No access token or refresh token found in the response.');
                    return throwError('Invalid token response.');
                }
                
                return of(response);
            }),
            catchError((error) => {
                console.error('Error during token refresh:', error);
    
                // Handle specific error cases
                if (error.status === 500) { // Your backend returns 500 when refresh token is not found
                    console.warn('Refresh token not found in the database. User needs to log in again.');
                    return throwError('Refresh token is not valid. User needs to log in again.');
                }
    
                // If other errors occur, handle accordingly
                return this._handleUnauthorized(error);
            })
        );
    }
    
    
    /**
     * Handle unauthorized errors (e.g., invalid or expired tokens)
     */
    _handleUnauthorized(error: any): Observable<any> {
        console.error('Unauthorized error:', error);
    
        // Implement your logic to handle unauthorized errors, such as logging out the user
        // or redirecting them to the login page.
    
        return of(false); // Return false to indicate that the refresh or authentication failed.
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        const accessToken = localStorage.getItem('accessToken'); // Check if accessToken is stored
    
        if (!accessToken) {
            console.error('Access token is missing');
            return of(false);
        }
    
        console.log('Access token found, making API call to sign out...');
    
        // Set headers with the access token for authorization
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}` // Add access token in Authorization header
        });
    
        // Log headers for debugging
   
    
        // Backend API call for sign-out
        return this._httpClient
            .post(this.apiUrl + '/api/auth/signout', {}, { headers }) // Ensure the API URL is correct
            .pipe(
                tap(() => {
                    console.log('API sign-out success');
                    // Remove tokens from local storage after successful sign-out
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    console.log('Tokens removed and user signed out');
    
                    // Set the authenticated flag to false
                    this._authenticated = false;
                }),
                catchError((error) => {
                    console.error('Error during sign-out: ', error);
    
                    // Ensure tokens are removed even if the backend API call fails
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    this._authenticated = false;
    
                    return of(false); // Return a false observable in case of error
                })
            );
    }
    
    

    /**
     * Check the authentication status
     */
 

    /**
     * Handle unauthorized errors and sign the user out


    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { username: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }



}

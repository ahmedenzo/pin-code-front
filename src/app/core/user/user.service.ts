import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

    constructor() {
        this.loadUserFromLocalStorage();
        this.loadUserIdFromSession(); // Load user ID from sessionStorage at startup
    }

    get user$(): Observable<User | null> {
        return this._user.asObservable();
    }

    set user(value: User | null) {
        this._user.next(value);
        if (value) {
            this.storeUserIdInSession(value.id); // Store user ID in sessionStorage when user is set
        }
    }

    setUserFromSignIn(user: User): void {
        console.log('UserService: setUserFromSignIn called with:', user);
        this._user.next(user);
        localStorage.setItem('user', JSON.stringify(user));
        this.storeUserIdInSession(user.id); // Store user ID in sessionStorage
    }

    loadUserFromLocalStorage(): void {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user: User = JSON.parse(userJson);
            this._user.next(user);
            this.storeUserIdInSession(user.id); // Store user ID in sessionStorage when loading from localStorage
        }
    }

    private loadUserIdFromSession(): void {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            // Optionally, you can fetch user details using the userId and set the user if needed
            // This part is optional based on your application's needs
        }
    }

    private storeUserIdInSession(userId: string): void {
        sessionStorage.setItem('userId', userId); // Store user ID in sessionStorage
    }

    // Clear user ID from sessionStorage only on sign out
    clearUserIdFromSession(): void {
        // This will be called only from AuthService during sign out
    }

    getAccessToken(): string {
        return localStorage.getItem('accessToken') ?? ''; // Return the access token or an empty string if not found
    }

    /**
     * Get the current user value
     */
    getUser(): User | null {
        return this._user.getValue(); // Now we can use getValue
    }

    getRole(): string | null {
        const user = this.getUser(); // Retrieve the current user value
        return user?.role || null; // Return role or null if none
    }

    hasRole(role: string): boolean {
        const userRole = this.getRole(); // Retrieve the current user's role
        return userRole === role; // Check if the user's role matches the provided role
    }

    /**
     * Set the user directly from sign-in response.
     * No need to make any additional API call.
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            }),
        );
    }
}

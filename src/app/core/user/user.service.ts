import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { BehaviorSubject, map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null); // Use BehaviorSubject

    get user$(): Observable<User | null> {
        return this._user.asObservable();
    }

    // Getter & Setter for user
    set user(value: User | null) {
        console.log('UserService: Setting user:', value);
        this._user.next(value);
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
    setUserFromSignIn(user: User): void {
        console.log('UserService: setUserFromSignIn called with:', user);
        this._user.next(user);
    }
  
    
    
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) =>
            {
                this._user.next(response);
            }),
        );
    }

}

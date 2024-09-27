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
        return localStorage.getItem('accessToken') ?? '';
    }
    /**
     * Get the current user value
     */
    getUser(): User | null {
        return this._user.getValue(); 
    }

    getRole(): string | null {
        const user = this.getUser(); 
        return user?.role || null; 
    }

    hasRole(role: string): boolean {
        const userRole = this.getRole(); 
        return userRole === role; 
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

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserService
{
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // Getter & Setter for user
    set user(value: User) {
  
        console.log('UserService: Setting user:', value);
        this._user.next(value);
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

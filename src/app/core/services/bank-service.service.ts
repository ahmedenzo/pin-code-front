import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environment.prod';
import { TabBank } from '../Model/Bank.model';

@Injectable({ providedIn: 'root' })
export class BankServiceService {
    private _httpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl; 

    constructor() {}



    

    createBank(TabBank: any): Observable<any> {
        const url = `${this.apiUrl}/api/bankagency/Addbanks`; 
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        });
        const options = { headers: headers };
      
        return this._httpClient.post<any>(`${url}`, TabBank, options)
          .pipe(
            catchError(this.handleError)
          );
      }
      private handleError(error: HttpErrorResponse): Observable<never> {
        // Log the error message for debugging
        console.error('An error occurred:', error);
    
        // Check if the error response has a message and status code
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            console.error('Client-side error:', error.error.message);
        } else {
            // A backend error occurred.
            console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error.message}`);
        }
    
        // Return a user-friendly error message
        const errorMessage = error.error?.message || 'An unexpected error occurred. Please try again later.';
        // Return an observable with a user-facing error message
        return throwError(errorMessage);
    }


    getAllBanks(): Observable<any> {
        const url = `${this.apiUrl}/api/bankagency/banks/list`; 
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        });
        return this._httpClient.get<any>(url, { headers })
          .pipe(
            catchError(this.handleError)
          );


}

associateAdminToBank(adminId: string, bankId: number): Observable<any> {
    const url = `${this.apiUrl}/api/auth/associateAdminToBank`; 
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
    });
    
    // Use HttpParams to create the query parameters
    const params = new HttpParams()
        .set('adminId', adminId)
        .set('bankId', bankId.toString()); // Ensure bankId is a string

    return this._httpClient.post(url, null, { headers, params }); // Send params as query string
}

registerAdmin(user: any): Observable<any> {
    const url = `${this.apiUrl}/api/auth/signup`; 
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
    });
    

    return this._httpClient.post(url, user, { headers });
}
}
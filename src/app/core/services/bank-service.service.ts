import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../../environment.prod';
import { TabBank } from '../Model/Bank.model';

@Injectable({ providedIn: 'root' })
export class BankServiceService {
    private _httpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl; 

    constructor() {}

   
    createBank(bankName: TabBank): Observable<any> {
        const url = `${this.apiUrl}/api/banks`; 
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        });

        return this._httpClient.post(url, { bankName }, { headers }).pipe(
            tap(response => {
                console.log('Bank created successfully:', response);
            }),
            catchError(this.handleError) 
        );
    }

    
    private handleError(error: any): Observable<never> {
        console.error('An error occurred:', error);
     
        return of(); 
    }
    

}

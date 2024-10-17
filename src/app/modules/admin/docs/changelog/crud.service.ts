import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private apiUrl = 'http://localhost:8080/api/otp'; 
  private apiUrl1 = 'http://localhost:8080/api/cardholders'; 

  constructor(private http: HttpClient) { }

  verifyCardholder(cardNumber: string, nationalId: string, gsm: string, finalDate: string): Observable<any> {
    const url = `${this.apiUrl1}/verify`;
    const body = { cardNumber, nationalId, gsm, finalDate };
    return this.http.post(url, body)
      .pipe(
        catchError(this.handleError<any>('verifyCardholder'))
      );
  }
  
  validateOtp(phoneNumber: string, otp: string): Observable<any> {
    const url = `${this.apiUrl}/validate`;
    const body = { phoneNumber, otp };
    return this.http.post(url, body)
      .pipe(
        catchError(this.handleError<any>('validateOtp'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return throwError(error);
    };
  }
}


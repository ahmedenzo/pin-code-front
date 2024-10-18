import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { fromEvent, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TabCardHolderService {
  private _httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/cardholders`;

  constructor() {}

  // Helper method to get Authorization header
  private getAuthHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  }

  // Helper method to handle errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server error: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage); // Log the error to the console
    return throwError(() => new Error(errorMessage));
  }

  // Upload file with Authorization token
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.getAuthHeaders();

    return this._httpClient.post(`${this.apiUrl}/upload`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Stream progress updates with Authorization token
  getProgress(): Observable<number> {
    const headers = this.getAuthHeaders();
    const eventSource = new EventSource(`${this.apiUrl}/progress`, { withCredentials: true });

    return fromEvent(eventSource, 'progress').pipe(
      map((event: any) => +event.data),  // Parse event data as a number
      catchError(this.handleError)
    );
  }

  // Get all cardholder load reports
  getAllLoadReports(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/load-reports`, { headers })
      .pipe(
        tap(response => console.log('Load reports retrieved successfully', response)),
        catchError((error) => {
          console.error('Error retrieving load reports:', error);
          return this.handleError(error);
        })
      );
  }

  // Get a specific load report by ID
  getLoadReportById(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/load-reports/${id}`, { headers })
      .pipe(
        tap(response => console.log('Load report retrieved successfully', response)),
        catchError((error) => {
          console.error('Error retrieving load report:', error);
          return this.handleError(error);
        })
      );
  }
}

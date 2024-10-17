/* eslint-disable max-len */
import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CardNumberFormatDirective } from './card-number-format.directive';
import { NgOtpInputModule } from 'ng-otp-input';
import { CrudService } from './crud.service';
import { OtpInputDirective } from './otp-input.directive';
import { AlertComponent } from '../alert/alert/alert.component';
@Component({
    selector       : 'changelog',
    templateUrl    : './changelog.html',
    styleUrls: ['./crud.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports: [
        CommonModule,
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        NgClass,
        CardNumberFormatDirective,
        MatInputModule,
        TextFieldModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        NgOtpInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatChipsModule,
        MatDatepickerModule,
        OtpInputDirective,
        AlertComponent,
      ],
})
export class ChangelogComponent
{
    firstFormGroup: FormGroup;
    otpFormGroup: FormGroup;
    otpSent = false;
    phoneNumber: string = '';
    showSnackbar = false;
    isSuccess = false;
    snackbarMessage = '';
    otpVerified = false;
    alertType: 'success' | 'warning' | 'error' = 'success';
    alertMessage = '';
    currentYear: number = new Date().getFullYear() % 100; // Get the last two digits of the current year
  
    months = [
      { value: '01', viewValue: '01' },
      { value: '02', viewValue: '02' },
      { value: '03', viewValue: '03' },
      { value: '04', viewValue: '04' },
      { value: '05', viewValue: '05' },
      { value: '06', viewValue: '06' },
      { value: '07', viewValue: '07' },
      { value: '08', viewValue: '08' },
      { value: '09', viewValue: '09' },
      { value: '10', viewValue: '10' },
      { value: '11', viewValue: '11' },
      { value: '12', viewValue: '12' },
    ];
  
    years = Array.from({ length: 10 }, (_, i) => {
      const year = (this.currentYear + i).toString().padStart(2, '0');
      return { value: year, viewValue: `20${year}` };
    });
    constructor(
      private _formBuilder: FormBuilder,
      private crudService: CrudService,
    ) {
      this.firstFormGroup = this._formBuilder.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        nationalId: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        gsm: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        finalDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      });
  
      this.otpFormGroup = this._formBuilder.group({
        otp1: ['', [Validators.required, Validators.maxLength(1)]],
        otp2: ['', [Validators.required, Validators.maxLength(1)]],
        otp3: ['', [Validators.required, Validators.maxLength(1)]],
        otp4: ['', [Validators.required, Validators.maxLength(1)]],
        otp5: ['', [Validators.required, Validators.maxLength(1)]],
        otp6: ['', [Validators.required, Validators.maxLength(1)]],
      });
    }
    cardNumberValidator(control: AbstractControl): { [key: string]: any } | null {
      const value = control.value ? control.value.replace(/\D/g, '') : '';
      if (!value) {
        return { 'required': true };
      }
      if (value.length !== 16 || !this.isValidCardNumber(value)) {
        return { 'pattern': true };
      }
      return null;
    }
  
    private isValidCardNumber(cardNumber: string): boolean {
      let sum = 0;
      let shouldDouble = false;
  
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
  
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
  
        sum += digit;
        shouldDouble = !shouldDouble;
      }
  
      return (sum % 10 === 0);
    }
    formatExpiration(event: any) {
      const input = event.target;
      let value = input.value.replace(/\D/g, ''); // Remove non-digit characters
    
      if (value.length > 4) {
        value = value.slice(0, 4); // Limit to 4 digits
      }
    
      if (value.length <= 2) {
        input.value = value;
      } else {
        input.value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }
    
      // Set the formatted value back to the form control
      this.firstFormGroup.get('finalDate')?.setValue(input.value, { emitEvent: false });
    
      // Validate the month and year
      this.validateExpiration(value);
    }
    
    validateExpiration(value: string) {
      const month = parseInt(value.slice(0, 2), 10);
      const year = parseInt(value.slice(2, 4), 10);
    
      // Get the current year in two-digit format (e.g., 24 for 2024)
      const currentYear = new Date().getFullYear() % 100;
    
      if (month < 1 || month > 12) {
        this.firstFormGroup.get('finalDate')?.setErrors({ invalidMonth: true });
      } else if (year < currentYear) {
        this.firstFormGroup.get('finalDate')?.setErrors({ invalidYear: true });
      } else {
        this.firstFormGroup.get('finalDate')?.setErrors(null);
      }
    }
    
    
    sendOtp() {
      if (this.firstFormGroup.valid) {
        const { cardNumber, cin, phoneNumber, cardExpiration } = this.firstFormGroup.value;
    
        // Format the cardExpiration to MMYY
        const formattedExpiration = cardExpiration.replace('/', '');
    
        // Prepend the country code to the phone number
        this.phoneNumber = '00216' + phoneNumber;
    
        this.crudService.verifyCardholder(cardNumber, cin, this.phoneNumber, formattedExpiration).subscribe(
          (response) => {
            console.log('Verification successful:', response);
            this.otpSent = true;
            this.showAlert(response.message, 'success');
          },
          (error) => {
            console.error('Verification failed:', error.error.message);
            this.showAlert(error.error.message, 'error');
          }
        );
      }
    }
    
  
    verifyOtp(): void {
      if (this.otpFormGroup.valid) {
        const otp = Object.values(this.otpFormGroup.value).join('');
        this.crudService.validateOtp(this.phoneNumber, otp).subscribe(
          (response) => {
            console.log('OTP validation successful:', response);
            this.showAlert(response.message, 'success'); // Show success message
            this.otpVerified = true; // Set OTP verification status to true
            
            // Wait 3 seconds before resetting forms and showing the cardholder form
            setTimeout(() => {
              this.resetOtpForm(); // Reset OTP form fields
              this.resetCardholderForm(); // Reset cardholder form fields
              this.otpSent = false; // Show the cardholder form
              this.otpVerified = false; // Reset OTP verification status
            }, 2000);
          },
          (error) => {
            console.error('OTP validation failed:', error.error.message);
            this.showAlert(error.error.message, 'error'); // Show error message
          }
        );
      } else {
        console.log('Form is invalid');
      }
    }
    
  
    showAlert(message: string, type: 'success' | 'warning' | 'error') {
      this.alertMessage = message;
      this.alertType = type;
      setTimeout(() => {
        this.alertMessage = '';
      }, 5000);
    }
   
    cancelOtp(): void {
      this.otpSent = false; 
      this.otpVerified = false;
    }
    resetCardholderForm(): void {
      // Reset cardholder form fields
      this.firstFormGroup.reset();
    }
    resetOtpForm(): void {
      // Reset OTP form fields
      this.otpFormGroup.reset();
    }
    
  }
  
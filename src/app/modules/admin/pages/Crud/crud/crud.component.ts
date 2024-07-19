import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

import { AlertComponent } from './alert/alert/alert.component';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
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
export class CrudComponent {
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

  constructor(
    private _formBuilder: FormBuilder,
    private crudService: CrudService,
  ) {
    this.firstFormGroup = this._formBuilder.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
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

  sendOtp() {
    if (this.firstFormGroup.valid) {
      const { cardNumber, cin, phoneNumber } = this.firstFormGroup.value;


      this.phoneNumber = '216' + phoneNumber;

      this.crudService.verifyCardholder(cardNumber, cin, this.phoneNumber).subscribe(
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
          }, 5000);
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

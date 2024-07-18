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
import { MatSnackBar } from '@angular/material/snack-bar';  
import { NgOtpInputModule } from 'ng-otp-input';
import { CrudService } from './crud.service';
import { OtpInputDirective } from './otp-input.directive'; // Assurez-vous de définir le bon chemin
import { FuseAlertService } from '@fuse/components/alert/alert.service';


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

  constructor(
    private _formBuilder: FormBuilder,
    private crudService: CrudService,
    private _snackBar: MatSnackBar,
    private _fuseAlertService: FuseAlertService
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

      // Prepend '216' to the phone number
      this.phoneNumber = '216' + phoneNumber;

      this.crudService.verifyCardholder(cardNumber, cin, this.phoneNumber).subscribe(
        (response) => {
          console.log('Verification successful:', response);
          this.otpSent = true;
          this.openSnackBar(response.message, 'success');
        },
        (error) => {
          console.error('Verification failed:', error.error.message);
          this.openSnackBar(error.error.message, 'error');
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
          this.openSnackBar(response.message, 'success'); // Show success message
          this.otpVerified = true; // Set OTP verification status to true
        },
        (error) => {
          console.error('OTP validation failed:', error.error.message);
          this.openSnackBar(error.error.message, 'error'); // Show error message
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }


  openSnackBar(message: string, type: 'success' | 'error') {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [type === 'success' ? 'snackbar-success' : 'snackbar-error']
    });
  }
  cancelOtp(): void {
    this.otpSent = false; 
    this.otpVerified = false;
  }
  
}
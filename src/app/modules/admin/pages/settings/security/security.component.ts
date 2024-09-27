import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { Subscription } from 'rxjs';
import { SecurityServiceService } from 'app/core/services/security-service.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.value;

        // Regular expression for password validation
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validate the password
        const valid = passwordPattern.test(password);
        return valid ? null : { passwordComplexity: true };
    };
}

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    styleUrls: ['./Security.component.css'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSlideToggleModule, MatButtonModule, MatSelectModule, FuseAlertComponent, MatOptionModule, CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsSecurityComponent implements OnInit
{
    showCurrentPassword: boolean = false;  // For toggling current password visibility
    showNewPassword: boolean = false;
    securityForm: UntypedFormGroup;
    admins: any[] = [];
    superadminId: string | null = null;  // To store the user ID
    private _subscription: Subscription;
    errorMessage: string | null = null;
    successMessage: string | null = null;
    errorMessagegsa: string | null = null;
    
    errorMessageadmi: string | null = null;
    successMessageadmi: string | null = null;

    errorMessagech: string | null = null;
    successMessagech: string | null = null;


    successMessagegsa: string | null = null;
    generatedPasswordsuper: string | null = null; 
    generatedPassword: string | null = null; 
    private _bankService = inject(BankServiceService);
    private _fuseAlertService = inject(FuseAlertService);
    private _SecurityServiceService=inject(SecurityServiceService)


    constructor(
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.securityForm = this._formBuilder.group({
            currentPasswordsuper: [''],
            newPasswordsuper: ['', passwordComplexityValidator()], // Apply the custom validator
            AdminId: [''],
        });
        this.getadmins();
 
    }
    

 
        

 
    
    onGenerateRandomPasswordadmin(): void {
        const adminId = this.securityForm.get('AdminId')?.value; 
    
        if (adminId) {
            this._SecurityServiceService.generateRandomPassword(adminId).subscribe({
                next: (response) => {
                    console.log('Random password generated for admin:', response);
                    
                    // Check if response.message is defined
                    if (response && response.message) {
                        // Updated regex to capture the password correctly
                        const regex = /New password: (.+)$/;
                        const match = response.message.match(regex);
                        
                        if (match && match[1]) {
                            this.generatedPassword = match[1].trim(); // Set the extracted password
                        } else {
                            this.generatedPassword = 'Password format not recognized';
                        }
                    } else {
                        this.generatedPassword = 'No password generated';
                    }
    
                    // Set success message and clear error message
             
                    this.errorMessageadmi = null;
    
                    // Mark for check to update the UI
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Failed to generate random password', error);
                    this.errorMessageadmi = 'Failed to generate random password';
                    this.successMessageadmi = null;
                    this.cdr.markForCheck();
                }
            });
        } else {
            this.errorMessageadmi = 'Please select an admin.';
            this.cdr.markForCheck();
        }
    }


    onChangePasswordSuperAdmin(): void {
        const defaultUserId = "1"; // Default userId
        this.superadminId = defaultUserId;
    
        if (this.securityForm.valid && this.superadminId) {  
            const formValues = this.securityForm.value;
            formValues.userId = this.superadminId;  
    
            // Create a plain object instead of FormData
            const changePasswordRequest = {
                userId: formValues.userId,
                oldPassword: formValues.currentPasswordsuper,
                newPassword: formValues.newPasswordsuper
            };
    
            console.log('Change Password Request being submitted:', changePasswordRequest);
    
            this._SecurityServiceService.changePassword(changePasswordRequest).subscribe({
                next: (response) => {
                    console.log('Password changed successfully:', response);
                    this.successMessage = 'Password changed successfully!';
                    this.errorMessage = null;
                    this.securityForm.reset();
                    this.cdr.markForCheck();
                    this.getadmins();
    
                    setTimeout(() => {
                        this.successMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to change password', error);
                    this.errorMessage = 'Failed to change password '+error;
                    this.successMessage = null;
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                }
            });
        } else {
            console.error('Password error or userId not available');
            this.errorMessage = 'Password not valid or user not available';
        }
    }
    copyToClipboard(password: string | undefined): void {
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    console.log('Password copied ');
                    this.successMessagech = 'Password copied '; // Set success message
                    this.cdr.markForCheck();
    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        this.successMessagech = null;
                        this.cdr.markForCheck();
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    this.errorMessagech = 'Failed to copy password'; // Set error message
                    this.cdr.markForCheck();
    
                    // Clear error message after 3 seconds
                    setTimeout(() => {
                        this.errorMessagech = null;
                        this.cdr.markForCheck();
                    }, 3000);
                });
        }
    }

    copyToClipboardadmin(password: string | undefined): void {
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    console.log('Password copied ');
                    this.successMessageadmi = 'Password copied '; // Set success message
                    this.cdr.markForCheck();
    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        this.successMessageadmi = null;
                        this.cdr.markForCheck();
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    this.errorMessageadmi = 'Failed to copy password'; // Set error message
                    this.cdr.markForCheck();
    
                    // Clear error message after 3 seconds
                    setTimeout(() => {
                        this.errorMessageadmi = null;
                        this.cdr.markForCheck();
                    }, 3000);
                });
        }
    }



    
    
    
    onGenerateRandomPassword(): void {
        const defaultUserId = "1"; 
        this.superadminId = defaultUserId;
    
        this._SecurityServiceService.generateRandomPassword(this.superadminId).subscribe({
            next: (response) => {
                console.log('Random password generated for superadmin:', response);
                
                // Check if response.message is defined
                if (response && response.message) {
                    // Updated regex to capture the password correctly
                    const regex = /New password: (.+)$/; // Using .+ to capture everything after 'New password: '
                    const match = response.message.match(regex);
                    
                    if (match && match[1]) {
                        this.generatedPasswordsuper = match[1].trim(); // Set the extracted password
                    } else {
                        this.generatedPasswordsuper = 'Password format not recognized';
                    }
                } else {
                    this.generatedPasswordsuper = 'No password generated';
                }
    
                this.successMessagegsa = response.message; 
                this.errorMessagegsa = null;
                this.cdr.markForCheck();
    
                setTimeout(() => {
                    this.successMessagegsa = null;
                    this.cdr.markForCheck();
                }, 4000);
            },
            error: (error) => {
                console.error('Failed to generate random password', error);
                this.errorMessagegsa = 'Failed to generate random password';
                this.successMessagegsa = null;
                this.cdr.markForCheck();
                
                setTimeout(() => {
                    this.errorMessagegsa = null;
                    this.cdr.markForCheck();
                }, 4000);
            }
        });
    }
    
    

    getadmins(): void {
        this._bankService.GetAdmins().subscribe({
            next: (response) => {
                console.log('Fetched Admins data:', response);

                if (Array.isArray(response) && response.length > 0) {
                    this.admins = response;
                    console.log('Admins data:', this.admins);
                } else {
                    console.warn('No valid admins data found. Response structure:', response);
                }
            },
            error: (error) => {
                console.error('Error fetching admins:', error);
            }
        });
    }

    onCancel(): void {
        this.securityForm.reset();
        this.cdr.markForCheck();
    }

    showAlert(): void {
        this._fuseAlertService.show('myAlertName');
    }

    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName');
    }

    ngOnDestroy(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();  
        }
    }
}

import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BankServiceService } from 'app/core/services/bank-service.service'; 
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { UserService } from 'app/core/user/user.service';
@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    styleUrls: ['./account.component.css'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatTableModule,
        MatButtonModule,
        MatExpansionModule,
        FuseAlertComponent,
        CommonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsAccountComponent implements OnInit {
    private _fuseAlertService = inject(FuseAlertService);
    private _userService = inject (UserService)
    
    private _bankService = inject(BankServiceService);  
    accountForm: UntypedFormGroup;
    adminForm: UntypedFormGroup;
    logoPreview: string | ArrayBuffer | null = null;
    userid : string
    logoFile: File | null = null; // Store the logo file
    errorMessage: string | null = null; //
    successMessage: string | null = null;
    successMessageadmin: string | null = null;
    errorMessageadmin: string | null = null;
    showPassword: boolean = false; // Add this line
    banks: any[] = [];   
  

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.accountForm = this._formBuilder.group({
            name: ['', Validators.required],
            codeBanque: ['', Validators.required],
            libelleBanque: ['', Validators.required],
            enseigneBanque: ['', Validators.required],
            ica: ['', Validators.required],
            binAcquereurVisa: ['', Validators.required],
            binAcquereurMcd: ['', Validators.required],
            ctb: ['', Validators.required],
            banqueEtrangere: ['', Validators.required],
            logo: [null] // Add a form control for the logo
        });

        this.adminForm = this._formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            email: ['', Validators.required],
            phoneNumber: ['', Validators.required],
            bankId: ['', Validators.required],
        });



       // this.loadUserId();
        
        this.loadBanks()
    }


   /* private loadUserId(): void {
        const user = this._userService.getUser();
        this.userid = user?.id || '';
        console.log('User ID:', this.userid);
        sessionStorage.setItem('userId', this.userid); 
    }*/

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword; // Toggle password visibility
    }
    displayedColumns: string[] = ['name', 'bank_code','libelleBanque', 'actions'];
    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.logoPreview = reader.result;
                this.logoFile = file; 
                this.cdr.markForCheck();
            };
            reader.readAsDataURL(file);
            this.accountForm.patchValue({ logo: file }); 
        }
    }
    
    loadBanks(): void {
  
        this._bankService.getAllBanks().subscribe({
            next: (response) => {
                console.log('Fetched banks data:', response); // Log the data to see its structure
                if (response && response.banks && Array.isArray(response.banks)) {
                    this.banks = response.banks; // Set the banks array if it exists in the response
                    console.log('Banks data:', this.banks);
                } else {
               
                }
         
            },
            error: (error) => {
                console.error('Error fetching banks:', error);

           
            }
        });
    }
    

    onSave(): void {
        if (this.accountForm.valid) {
          
            this.accountForm.patchValue({
                logo: this.logoFile  
            });

            const formData = this.accountForm.value;
    
            console.log('Bank data being submitted with logo:', formData);
    
            // Call the service to save the bank
            this._bankService.createBank(formData).subscribe({
                next: (response) => {
                    console.log('Bank created successfully:', response);
                    this.successMessage = 'Bank created successfully!';
                    this.errorMessage = null;  // Clear error message on success
                    this.accountForm.reset();  // Optionally reset the form after success
                    this.logoPreview = null;  // Clear the logo preview
                    this.logoFile = null;     // Clear the logo file reference
                    this.cdr.markForCheck();
    
                    // Show the success message for 4 seconds, then hide it
                    setTimeout(() => {
                        this.successMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to create bank:', error);
    
                    // Set the error message for the fuse-alert
                    this.errorMessage = 'Failed to create bank '; 
                    this.successMessage = null;  
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                    // Log to the console for debugging
                    console.log('Displayed error message:', this.errorMessage);
                }
            });
        }
    }


    onSaveadmin(): void {
        if (this.adminForm.valid) {
            const bankId = this.adminForm.get('bankId').value; // Get the bankId from the form
            const adminId = this.userid; // Use the user ID from the user service
    
            console.log('Admin ID:', adminId, 'Bank ID:', bankId);
    
            // Call the service to associate the admin with the bank
            this._bankService.associateAdminToBank(adminId, bankId).subscribe({
                next: (response) => {
                 
                    console.log('Admin associated with bank successfully:', response);
                    this.successMessageadmin = 'Admin associated with bank successfully!';
                    this.errorMessageadmin = null;  // Clear error message on success
                    this.adminForm.reset();  // Reset the form after success
                    this.cdr.markForCheck();
    
                    // Show success message for 4 seconds
                    setTimeout(() => {
                        this.successMessageadmin = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to associate admin with bank:', error);
    
                    // Set the error message for the fuse-alert
                    this.errorMessageadmin = 'Failed to associate admin with bank'; 
                    this.successMessageadmin = null;  
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessageadmin = null;
                        this.cdr.markForCheck();
                    }, 4000);
                    // Log to the console for debugging
                    console.log('Displayed error message:', this.errorMessageadmin);
                }
            });
        }
    }
    
    
    
    onCancel(): void {
        this.accountForm.reset(); 
        this.logoPreview = null; 
        this.logoFile = null; 
        this.cdr.markForCheck(); 
    }
    onCanceladmin(): void {
        this.adminForm.reset(); 
        this.cdr.markForCheck(); 
    }
    
    showAlert(): void {
        this._fuseAlertService.show('myAlertName'); // Shows the alert
    }

    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); // Dismisses the alert
    }

    // Other methods like onEdit, onDelete...
}

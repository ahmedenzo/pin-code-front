import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
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
    private _bankService = inject(BankServiceService);  

@ViewChild('accountFormRef') accountFormRef!: ElementRef;



    accountForm: UntypedFormGroup;
    adminForm: UntypedFormGroup;
    AssoAdminForm: UntypedFormGroup;
    logoPreview: string | ArrayBuffer | null = null;

    logoFile: File | null = null; // Store the logo file
    errorMessage: string | null = null; //
    successMessage: string | null = null;
    errorMessageu: string | null = null; //
    successMessageu: string | null = null;
    errorMessagea: string | null = null; //
    successMessagea: string | null = null;
    successMessageadmin: string | null = null;
    errorMessageadmin: string | null = null;
    showPassword: boolean = false; // Add this line
    isEditMode: boolean = false; // Flag to check if we are in edit mode
    selectedBankId: any; // To keep track of which bank is being edited
    selectedBank:any;
    banks: any[] = [];   
    admins : any [] =[]
  

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
            logo: [null] 
        });

        this.adminForm = this._formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            email: ['', Validators.required],
            phoneNumber: ['', Validators.required],
          
        });

        this.AssoAdminForm = this._formBuilder.group({
            AdminId: ['', Validators.required],
            bankId: ['', Validators.required],
            
        });
        this.loadBanks()
        this.getadmins()
    }

    onEdit(bank: any) {
        this.accountForm.patchValue({
            name: bank.name,
            codeBanque: bank.codeBanque,
            libelleBanque: bank.libelleBanque,
            enseigneBanque: bank.enseigneBanque,
            ica: bank.ica,
            binAcquereurVisa: bank.binAcquereurVisa,
            binAcquereurMcd: bank.binAcquereurMcd,
            ctb: bank.ctb,
            banqueEtrangere: bank.banqueEtrangere,
        });

  
        this.selectedBankId = bank.id; 
        this.selectedBank=bank.logo
        this.isEditMode = true; 
        this.logoPreview = `data:image/png;base64,${this.selectedBank}`; 
        this.scrollToForm();
        console.log('logo',this.logoPreview)
    }
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
 
onUpdate(): void {
  ;
    if (this.accountForm.valid) {
        const formData = new FormData();
        const bankRequest = { ...this.accountForm.value };
        delete bankRequest.logo;

        formData.append('bankRequest', JSON.stringify(bankRequest));


        if (this.logoFile) {
    
            formData.append('logo', this.logoFile); 
        } else if (this.selectedBank) {
            // No new logo selected, append the existing logo base64 string as a blob
            const existingLogoBlob = this.base64ToBlob(this.selectedBank, 'image/png');
            formData.append('logo', existingLogoBlob, 'existing-logo.png'); // Append existing logo as a file
        }

        if (this.selectedBankId) {
            this._bankService.updateBank(this.selectedBankId, formData).subscribe({
                next: (response) => {
                    this.successMessageu = 'Bank updated successfully!';
                    this.errorMessageu = null;  
                    this.accountForm.reset();  
                    this.logoPreview = null;  
  
                    this.logoFile = null;     
                    this.isEditMode = false; 
                    this.selectedBankId = null; 
                    this.cdr.markForCheck();
       
                    this.loadBanks()
                    this.getadmins()

                    setTimeout(() => {
                        this.successMessageu = null;
                    }, 4000);
                },
                error: (error) => {
                    this.errorMessageu = 'Failed to update bank'; 
                    this.successMessageu = null;  
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessageu = null;
                    }, 4000);
                }
            });
        } else {
            this.errorMessage = 'No bank selected for update';
        }
    } else {
        this.errorMessage = 'Form is invalid';
    }
}


    base64ToBlob(base64: string, type: string): Blob {
        const byteCharacters = atob(base64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Blob([byteNumbers], { type });
    }


    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword; 
    }
    displayedColumns: string[] = ['logo','name', 'bank_code','BankAdmin' ,'actions'];
    
    loadBanks(): void {
        this._bankService.getAllBanks().subscribe({
            next: (response) => {
                if (response && response.banks && Array.isArray(response.banks)) {
                    this.banks = [...response.banks];  
                    this.cdr.detectChanges();  
                }
            },
            error: (error) => {
                console.error('Error fetching banks:', error);
            }
        });
    }
    
    scrollToForm() {
        this.accountFormRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    getadmins(): void {
        this._bankService.GetAdmins().subscribe({
            next: (response) => {
                console.log('Fetched Admins data:', response);
            
                if (Array.isArray(response) && response.length > 0) {
                    this.admins = response; 
                    console.log('Admins data:', this.admins);
                    this.cdr.detectChanges(); 
                } else {
                   
                    console.warn('No valid admins data found. Response structure:', response);
                }
            },
            error: (error) => {
                console.error('Error fetching admins:', error);
            }
        });
    }
    
    

    onSave(): void {
      
    
        if (this.accountForm.valid && this.logoFile) {
            const formData = new FormData();
            const bankRequest = { ...this.accountForm.value };
            delete bankRequest.logo;
    
            formData.append('bankRequest', JSON.stringify(bankRequest));
            formData.append('logo', this.logoFile);
    
            this._bankService.createBank(formData).subscribe({
                next: (response) => {
                    console.log('Bank created successfully:', response);
                    this.successMessage = 'Bank created successfully!';
                    this.errorMessage = null;
                    this.accountForm.reset();
                    this.logoPreview = null;
                    this.logoFile = null;
                    this.loadBanks();
                    this.getadmins();
                    this.cdr.markForCheck();
    
                    setTimeout(() => {
                        this.successMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to create bank:', error);
                    this.errorMessage = 'Failed to create bank';
                    this.successMessage = null;
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                }
            });
        } else {
            console.error('Form is invalid or logo file is missing');
            this.errorMessage = 'Form is invalid or logo file is missing';
            setTimeout(() => {
                this.errorMessage = null;
                this.cdr.markForCheck();
            }, 4000);
        }
    }
    
    associateAdmin(): void {
        if (this.AssoAdminForm.valid) {
            const adminId = this.AssoAdminForm.get('AdminId')?.value;
            const bankId = this.AssoAdminForm.get('bankId')?.value;

            this._bankService.associateAdminToBank(adminId, bankId).subscribe({
                next: (response) => {
                    console.log('Admin associated to bank successfully:', response);
                    this.successMessagea = 'Admin associated to bank successfully!';
                    this.errorMessagea = null;  
                    this.AssoAdminForm.reset();  
                    this.cdr.markForCheck();
                    this.loadBanks()
                    this.getadmins()

                    setTimeout(() => {
                        this.successMessagea = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to associate admin to bank:', error);
                    this.errorMessagea = 'Failed to associate admin to bank'; 
                    this.successMessagea = null;  
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                }
            });
        }
    }

    refreshPage(): void {
        window.location.reload();
    }
    
    registerAdmin(): void {
        if (this.adminForm.valid) {
           
            const user = this.adminForm.value;
    
          
            user.role = ['admin']; 
    
            this._bankService.registerAdmin(user).subscribe({
                next: (response) => {
                    console.log('Admin registered successfully:', response);
                    this.successMessageadmin = 'Admin registered successfully!';
                    this.errorMessageadmin = null;  
                    this.adminForm.reset();  
                    this.cdr.markForCheck();
                    this.loadBanks()
                    this.getadmins()
    
                    setTimeout(() => {
                        this.successMessageadmin = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to register admin:', error);
                    this.errorMessageadmin = 'Failed to register admin'; 
                    this.successMessageadmin = null;  
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessageadmin = null;
                        this.cdr.markForCheck();
                    }, 4000);
                }
            });
        }
    }
    
    onCancel(): void {
        this.accountForm.reset(); 
        this.logoPreview = null; 
        this.logoFile = null; 
        this.cdr.markForCheck(); 
        this.isEditMode = false; 
    }
    onCanceladmin(): void {
        this.adminForm.reset(); 
        this.cdr.markForCheck(); 
    }
    onCancelass(): void {
        this.AssoAdminForm.reset(); 
        this.cdr.markForCheck(); 
    }
    showAlert(): void {
        this._fuseAlertService.show('myAlertName'); 
    }

    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); 
    }

  
}

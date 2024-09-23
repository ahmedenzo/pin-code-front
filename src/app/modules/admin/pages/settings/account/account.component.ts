import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent ,FuseAlertService } from '@fuse/components/alert';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatExpansionModule,
        FuseAlertComponent,
  
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsAccountComponent implements OnInit {
    private _fuseAlertService = inject(FuseAlertService);
    accountForm: UntypedFormGroup;
    logoPreview: string | ArrayBuffer | null = null;
    successMessage: string | null = null;
    logoFile: File | null = null; // Store the logo file
    items: { name: string, description: string }[] = [
        { name: 'Bank A', description: 'Description of Bank A' },

    ];
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
    onEdit(item: { name: string, description: string }): void {
        // Logic for editing the item
        console.log('Edit item:', item);
        // Here you can populate the form fields with the selected item data
        this.accountForm.patchValue(item);
    }

    onDelete(item: { name: string, description: string }): void {
        // Logic for deleting the item
        console.log('Delete item:', item);
        this.items = this.items.filter(i => i !== item); // Remove the item from the list
        this.cdr.markForCheck(); // Trigger change detection
    }
    onSave(): void {
        if (this.accountForm.valid) {
            // Logic to save the bank (e.g., API call)
            this.successMessage = 'Bank created successfully!';
            this.accountForm.reset(); // Optionally reset the form
            this.cdr.markForCheck();

            // Show the success message for 2 seconds, then hide it
            setTimeout(() => {
                this.successMessage = null;
                this.cdr.markForCheck();
            }, 4000);
        }
    }
    
    onCancel(): void {
        this.accountForm.reset(); 
        this.logoPreview = null; 
        this.logoFile = null; 
        this.cdr.markForCheck(); 
    }
    showAlert(): void {
        this._fuseAlertService.show('myAlertName'); // Shows the alert
    }
    
    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); // Dismisses the alert
    }
 
}

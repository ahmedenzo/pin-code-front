import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgencyService } from 'app/core/services/agency-service.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { Agency,Region,BizerteCities, TunisCities, NabeulCities, TozeurCities, ZaghouanCities, TataouineCities, SousseCities, SilianaCities, SidiBouzidCities, SfaxCities, MonastirCities, MedenineCities, ManoubaCities, MahdiaCities, KefCities, KebiliCities, KasserineCities, KairouanCities, JendoubaCities, GafsaCities, GabesCities, BenArousCities, BejaCities, ArianaCities } from 'app/core/Model/Agency.model';

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
  selector: 'app-settings-account-admin',
  templateUrl: './settings-account-admin.component.html',
  styleUrl: './settings-account-admin.component.scss',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone     : true,
  imports        : [
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatIconModule,
      MatTooltipModule,
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
export class SettingsAccountAdminComponent {

  private _fuseAlertService = inject(FuseAlertService);
  private _AgencyService = inject(AgencyService);  

@ViewChild('accountFormRef') accountFormRef!: ElementRef;

regions = Object.values(Region);  // Load regions
availableCities: string[] = [];
  accountForm: UntypedFormGroup;
  adminForm: UntypedFormGroup;
  AssoagentForm: UntypedFormGroup;

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
  selectedagencetId: any; // To keep track of which bank is being edited
  selectedagence:any;
  Agency: any[] = [];   
  agents : any [] =[]


  constructor(
      private _formBuilder: UntypedFormBuilder,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountForm = this._formBuilder.group({
      name: ['', Validators.required],               // Name of the agency
      contactEmail: ['', [Validators.required, Validators.email]],  // Contact email with email validation
      agencyCode: ['', Validators.required],         // Agency code
      contactPhoneNumber: ['', Validators.required], // Contact phone number
      adresse: ['', Validators.required],            // Address of the agency
      region: ['', Validators.required],             // Region field
      city: ['', Validators.required],    
  });

  
  this.accountForm.get('region')?.valueChanges.subscribe(region => {
      this.updateCitiesForRegion(region);
  });

      this.adminForm = this._formBuilder.group({
          username: ['', Validators.required],
          password: ['',passwordComplexityValidator()],
          email: ['', Validators.email],
          phoneNumber: ['', Validators.required],
        
      });

      this.AssoagentForm = this._formBuilder.group({
        userId: ['', Validators.required],
        agencyId: ['', Validators.required],
 
      });
      this.loadagency()
      this.getagents()
     
        console.log('SettingsAccountAdminComponent initialized');
  
    
  }
  updateCitiesForRegion(region: Region): void {
    switch (region) {
        case Region.Ariana:
            this.availableCities = Object.values(ArianaCities);
            break;
        case Region.Beja:
            this.availableCities = Object.values(BejaCities);
            break;
        case Region.BenArous:
            this.availableCities = Object.values(BenArousCities);
            break;
        case Region.Bizerte:
            this.availableCities = Object.values(BizerteCities);
            break;
        case Region.Gabes:
            this.availableCities = Object.values(GabesCities);
            break;
        case Region.Gafsa:
            this.availableCities = Object.values(GafsaCities);
            break;
        case Region.Jendouba:
            this.availableCities = Object.values(JendoubaCities);
            break;
        case Region.Kairouan:
            this.availableCities = Object.values(KairouanCities);
            break;
        case Region.Kasserine:
            this.availableCities = Object.values(KasserineCities);
            break;
        case Region.Kebili:
            this.availableCities = Object.values(KebiliCities);
            break;
        case Region.Kef:
            this.availableCities = Object.values(KefCities);
            break;
        case Region.Mahdia:
            this.availableCities = Object.values(MahdiaCities);
            break;
        case Region.Manouba:
            this.availableCities = Object.values(ManoubaCities);
            break;
        case Region.Medenine:
            this.availableCities = Object.values(MedenineCities);
            break;
        case Region.Monastir:
            this.availableCities = Object.values(MonastirCities);
            break;
        case Region.Nabeul:
            this.availableCities = Object.values(NabeulCities);
            break;
        case Region.Sfax:
            this.availableCities = Object.values(SfaxCities);
            break;
        case Region.SidiBouzid:
            this.availableCities = Object.values(SidiBouzidCities);
            break;
        case Region.Siliana:
            this.availableCities = Object.values(SilianaCities);
            break;
        case Region.Sousse:
            this.availableCities = Object.values(SousseCities);
            break;
        case Region.Tataouine:
            this.availableCities = Object.values(TataouineCities);
            break;
        case Region.Tozeur:
            this.availableCities = Object.values(TozeurCities);
            break;
        case Region.Tunis:
            this.availableCities = Object.values(TunisCities);
            break;
        case Region.Zaghouan:
            this.availableCities = Object.values(ZaghouanCities);
            break;
        default:
            this.availableCities = [];
            break;
    }
  }
  onEdit(agence: any) {
      this.accountForm.patchValue({
          name: agence.name,
          contactEmail: agence.contactEmail,
          contactPhoneNumber: agence.contactPhoneNumber,
          adresse: agence.adresse,
          region: agence.region,
          city: agence.city,
 
      });




      this.selectedagencetId = agence.id; 
      this.isEditMode = true; 

      this.scrollToForm();
  
  }


onUpdate(): void {
;
  if (this.accountForm.valid) {

      if (this.selectedagencetId) {
          this._AgencyService.updateAgency(this.selectedagencetId, this.accountForm.value).subscribe({
              next: (response) => {
                  this.successMessageu = 'Bank updated successfully!';
                  this.errorMessageu = null;  
                  this.accountForm.reset();  
    
                  this.isEditMode = false; 
                  this.selectedagencetId = null; 
                  this.cdr.markForCheck();
     
  

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



  togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword; 
  }
  displayedColumns: string[] = ['logo','name', 'bank_code','BankAdmin' ,'actions'];
  
 loadagency(): void {
      this._AgencyService.listAllAgencies().subscribe({
          next: (response) => {
          this.Agency=response
          console.log("les agance sont ",this.Agency)
          },
          error: (error) => {
              console.error('Error fetching banks:', error);
          }
      });
  }
  
  scrollToForm() {
      this.accountFormRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

 getagents(): void {
      this._AgencyService.GetAgents().subscribe({
          next: (response) => {
              console.log('Fetched Admins data:', response);
          
              if (Array.isArray(response) && response.length > 0) {
                  this.agents = response; 
                  console.log('Admins data:', this.agents);
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
    
  
      if (this.accountForm.valid ) {
 
  
  
          this._AgencyService.createAgency(this.accountForm.value).subscribe({
              next: (response) => {
                  console.log('Agency created successfully:', response);
                  this.successMessage = 'Agency created successfully!';
                  this.errorMessage = null;
                  this.accountForm.reset();
        
                  this.loadagency()
                  this.getagents()
                  this.cdr.markForCheck();
  
                  setTimeout(() => {
                      this.successMessage = null;
                      this.cdr.markForCheck();
                  }, 4000);
              },
              error: (error) => {
                  console.error('Failed to create Agency:');
                  this.errorMessage = 'Failed to create Agency';
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
  generatePassword() {
      const length = 12; // Ensure length is >= 8
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const specialChars = "@$!%*?&";  // Use only allowed special characters
      const allChars = lowercase + uppercase + numbers + specialChars;
  
      // Ensure at least one of each required character type
      let password = '';
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
      // Generate the remaining characters from the complete character set
      for (let i = 4; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
      }
  
      // Shuffle the password to avoid a predictable pattern
      password = this.shufflePassword(password);
  
      // Set the generated password to the form control
      this.adminForm.get('password')?.setValue(password);
    }
  
    // Utility function to shuffle the password characters
    shufflePassword(password: string): string {
      return password
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');
    }
   
  associateagent(): void {
      if (this.AssoagentForm.valid) {
          const userId = this.AssoagentForm.get('userId')?.value;
          const agencyId = this.AssoagentForm.get('agencyId')?.value;

          this._AgencyService.associateUserToAgency(userId, agencyId).subscribe({
              next: (response) => {
                  console.log('Admin associated to bank successfully:', response);
                  this.successMessagea = 'Admin associated to bank successfully!';
                  this.errorMessagea = null;  
                  this.AssoagentForm.reset();  
                  this.cdr.markForCheck();
             

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
  
  registeragent(): void {
      if (this.adminForm.valid) {
         
          const user = this.adminForm.value;
  console.log('ogagent',user)
        
          user.role = ['user']; 
  
          this._AgencyService.registerAgent(user).subscribe({
              next: (response) => {
                  console.log('Agent registered successfully:', response);
                  this.successMessageadmin = 'Agent registered successfully!';
                  this.errorMessageadmin = null;  
                  this.adminForm.reset();  
                  this.cdr.markForCheck();
            
             this.loadagency()
             this.getagents()
                  setTimeout(() => {
                      this.successMessageadmin = null;
                      this.cdr.markForCheck();
                  }, 4000);
              },
              error: (error) => {
                  console.error('Failed to register Agent:', error);
                  this.errorMessageadmin = 'Failed to register Agent'; 
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

      this.cdr.markForCheck(); 
      this.isEditMode = false; 
  }
  onCanceladmin(): void {
      this.adminForm.reset(); 
      this.cdr.markForCheck(); 
  }
  onCancelass(): void {
      this.AssoagentForm.reset(); 
      this.cdr.markForCheck(); 
  }
  showAlert(): void {
      this._fuseAlertService.show('myAlertName'); 
  }

  dismissAlert(): void {
      this._fuseAlertService.dismiss('myAlertName'); 
  }


}

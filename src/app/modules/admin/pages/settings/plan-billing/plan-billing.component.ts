import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation,inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSort ,MatSortModule} from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { TabBin } from 'app/core/Model/TabBin.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BinService } from 'app/core/services/bin-service.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ChangeDetectorRef } from '@angular/core';



@Component({
    selector       : 'settings-plan-billing',
    templateUrl    : './plan-billing.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [FormsModule, ReactiveFormsModule, FuseAlertComponent, MatRadioModule, NgFor, NgClass, NgIf, MatIconModule, MatTableModule,MatSortModule,MatSortModule,MatPaginatorModule,
         MatFormFieldModule, MatInputModule,
          MatSelectModule, MatOptionModule, MatButtonModule,
           CurrencyPipe],
           schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsPlanBillingComponent implements OnInit, AfterViewInit
{   private _binService = inject(BinService);
    @ViewChild('accountFormRef') accountFormRef!: ElementRef;
    private _fuseAlertService = inject(FuseAlertService);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    displayedColumns: string[] = ['bankCode','bin', 'systemCode', 'cardType', 'serviceCode','actions'];
    dataSource: MatTableDataSource<TabBin>;
    filteredDataSource = new MatTableDataSource<TabBin>
    bins: TabBin[] = []; 
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    accountForm: UntypedFormGroup;
    private _bankService = inject(BankServiceService);  
    banks: any[] = []; 
    uniqueBankCodes: string[] = []; 
    errorMessage: string | null = null; //
    successMessage: string | null = null;
    selectedBinId: any; // To keep track of which bank is being edited
    selectedBin:any;
    isEditMode: boolean = false;
    binPreview: string 
    isEditing: boolean = false;

    successMessagedelete: string | null = null;
    successMessageupdate: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef 
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.accountForm = this._formBuilder.group({
            bin: ['', Validators.required],
            systemCode: ['', Validators.required],
            cardType: ['', Validators.required],
            serviceCode: ['', Validators.required],
            bankId: ['',Validators.required],

        });

        this.dataSource = new MatTableDataSource(this.bins);
        this.filteredDataSource = new MatTableDataSource(this.bins); 
        this.dataSource.sort = this._sort;
        this.dataSource.paginator = this._paginator;
        this.fetchBinsData()
        this.loadBanks()
        this.uniqueBankCodes = Array.from(new Set(this.bins.map(bin => bin.bankName)));
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this._sort;
        this.dataSource.paginator = this._paginator;
    }
    fetchBinsData(): void {
        this._binService.getAllTabBins().subscribe(
            (response: TabBin[]) => {
                this.bins = response;
                this.dataSource.data = this.bins;
                this.cdr.detectChanges();
    
                // Extract unique bank codes from the fetched bins
                this.uniqueBankCodes = Array.from(new Set(this.bins.map(bin => bin.bankName)));
            },
            (error) => {
                console.error('Error fetching TabBins:', error);
            }
        );
    }
    
      

      onEdit(bin: any) {
        this.accountForm.patchValue({
            bin: bin.bin,
            systemCode: bin.systemCode,
            cardType: bin.cardType,
            serviceCode: bin.serviceCode,
            bankCode: bin.bankCode // Ensure this is the bank ID
        });
    
        this.selectedBinId = bin.id; 
        this.selectedBin = bin.bankCode; // Make sure this is correct
        console.log('Selected Bank ID:', this.selectedBin); // Log the selected bank ID
        this.isEditing = true; 
        this.isEditMode = true; // Indicate you are in editing mode
        this.scrollToForm();
    }

    getBankName(bankId: string): string {
        console.log('Searching for Bank ID:', bankId); // Log the bank ID
        console.log('Available Banks:', this.banks); // Log all banks to see their IDs
        const bank = this.banks.find(b => b.id === +bankId); // Ensure you convert types if necessary
        console.log('Bank ID:', bankId, 'Found Bank:', bank); // Log the found bank
        return bank ? bank.name : 'Unknown Bank';
    }
    
    
     createBin(): void {
    if (this.accountForm.invalid) {
      return;
    }

    const tabBinRequest = this.accountForm.value;
    this._binService.createTabBin(tabBinRequest).subscribe(
      (response) => {
        this.successMessage = 'Bin created successfully!';
        this.errorMessage = null;
        this.fetchBinsData();
        this.onCancel();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      (error) => {
        this.errorMessage = `Error creating Bin`;
        setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      }
    );
  }

  updateBin(): void {
    if (this.accountForm.invalid) {
      return;
    }

    const tabBinRequest = this.accountForm.value;
    this._binService.updateTabBin(this.selectedBinId, tabBinRequest).subscribe(
      (response) => {
        this.successMessageupdate = 'Bin updated successfully!';
        this.errorMessage = null;
        this.fetchBinsData();
        this.onCancel();
        setTimeout(() => {
          this.successMessageupdate = null;
        }, 3000);
      },
      (error) => {
        this.errorMessage = `Error updating Bin`;
        setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      }
    );
  }


    loadBanks(): void {
        this._bankService.getAllBanks().subscribe({
            next: (response) => {
                console.log('Fetched banks data:', response);
                if (response && response.banks && Array.isArray(response.banks)) {
                    this.banks = response.banks; 
                    console.log('Banks data:', this.banks); // Log the banks array to see its structure
                } else {
                    console.error('Invalid banks response format', response);
                }       
            },
            error: (error) => {
                console.error('Error fetching banks:', error);
            }
        });
    }
    
    
    onCancel(): void {
        this.accountForm.reset(); 
  
        this.isEditing = false;
        this.isEditMode = false

    }

    scrollToForm() {
        this.accountFormRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
    filterByBankCode(selectedBankCode: string): void {
        console.log('Selected Bank Code:', selectedBankCode); // Log the selected bank code
        // If the "All" option is selected, reset to show all data
        if (selectedBankCode === 'all') {
            this.dataSource.data = this.bins;
        } else {
            // Otherwise, filter the data based on the selected bank code
            this.dataSource.data = this.bins.filter(item => item.bankName === selectedBankCode);
        }
    
        // Reset paginator to the first page after filtering
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    
        // Re-apply sorting after filtering
        this.dataSource.sort = this._sort;
    }
    

    showAlert(): void {
        this._fuseAlertService.show('myAlertName'); 
    }

    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); 
    }
    
    onDelete(binId: string, binValue: string): void {
        console.log('Attempting to delete bin with ID:', binId); // Debugging statement
    
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Confirmation',
            message: `Are you sure you want to delete this bin: ${binValue}?`, // Include binValue in the message
            icon: {
                show: true,
                name: 'delete',
                color: 'warn' // Optionally use a color for the icon
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Delete',
                    color: 'warn' // Set the color for the confirm button
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: true // Make the dialog dismissible
        });
    
        // Subscribe to the afterClosed observable to get the user's decision
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                // Proceed with delete operation
                this._binService.deleteTabBin(binId).subscribe(
                    (response) => {
                        console.log('TabBin deleted successfully', response);
                        this.successMessagedelete = 'Bin deleted successfully!';
                        this.errorMessage = null;
                        this.fetchBinsData(); // Refresh the list of bins
                        setTimeout(() => {
                            this.successMessagedelete = null;
                        }, 3000);
                    },
                    (error) => {
                        console.error('Failed to delete Bin:', error);
                        this.errorMessage = 'Failed to delete Bin';
                        this.successMessagedelete = null;
    
                        setTimeout(() => {
                            this.errorMessage = null;
                        }, 3000);
                    }
                );
            } else {
                // User cancelled the deletion
                console.log('Deletion cancelled');
            }
        });
    }
    
    
    
    
}    
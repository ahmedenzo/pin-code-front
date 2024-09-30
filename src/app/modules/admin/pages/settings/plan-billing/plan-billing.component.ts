import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation,inject } from '@angular/core';
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
import { FuseAlertComponent } from '@fuse/components/alert';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { TabBin } from 'app/core/Model/TabBin .model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BinService } from 'app/core/services/bin-service.service';



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
    displayedColumns: string[] = ['bin', 'systemCode', 'cardType', 'serviceCode', 'bankCode','actions'];
    dataSource: MatTableDataSource<TabBin>;
    filteredDataSource = new MatTableDataSource<TabBin>
    bins: TabBin[] = []; 
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    accountForm: UntypedFormGroup;
    private _bankService = inject(BankServiceService);  
    banks: any[] = []; 
    uniqueBankCodes: string[] = []; 

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
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
            bankCode: ['', Validators.required],

        });

        this.dataSource = new MatTableDataSource(this.bins);
        this.filteredDataSource = new MatTableDataSource(this.bins); 
        this.dataSource.sort = this._sort;
        this.dataSource.paginator = this._paginator;
        this.fetchBinsData()
        this.loadBanks()
        this.uniqueBankCodes = Array.from(new Set(this.bins.map(bin => bin.bankCode)));
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this._sort;
        this.dataSource.paginator = this._paginator;
    }
    fetchBinsData(): void {
        this._binService.getAllTabBins().subscribe(
          (response: any) => {
            this.bins = response; 
            this.dataSource.data = this.bins; 
          },
          (error) => {
            console.error('Error fetching TabBins:', error); 
          }
        );
      }
      
      createBin(): void {
        if (this.accountForm.invalid) {
            return; 
        }

        const tabBinRequest = this.accountForm.value; 
        this._binService.createTabBin(tabBinRequest).subscribe(
            (response) => {
                console.log('TabBin created successfully', response);
                this.fetchBinsData(); 
                this.onCancel(); 
            },
            (error) => {
                console.error('Error creating TabBin:', error); 
            }
        );
    }
    loadBanks(): void {
  
        this._bankService.getAllBanks().subscribe({
            next: (response) => {
                console.log('Fetched banks data:', response); 
                if (response && response.banks && Array.isArray(response.banks)) {
                    this.banks = response.banks; 
                    console.log('Banks data:', this.banks);
                } else {
               
                }       
            },
            error: (error) => {
                console.error('Error fetching banks:', error);

           
            }
        });
    }

    onCancel(): void {
        this.accountForm.reset(); 

    }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
    filterByBankCode(selectedBankCode: string): void {
        // If the "All" option is selected, reset to show all data
        if (selectedBankCode === 'all') {
            this.dataSource.data = this.bins;
        } else {
            // Otherwise, filter the data based on the selected bank code
            this.dataSource.data = this.bins.filter(item => item.bankCode === selectedBankCode);
        }
    
        // Reset paginator to the first page after filtering
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    
        // Re-apply sorting after filtering
        this.dataSource.sort = this._sort;
    }
    
}    
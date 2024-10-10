import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatSelectModule } from '@angular/material/select';  
import { MatFormFieldModule } from '@angular/material/form-field';  
import { MatOptionModule } from '@angular/material/core';  
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Agency, Region, BizerteCities, ArianaCities } from 'app/core/Model/Agency.model';  
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';  
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-team-admin',
  standalone: true,
  imports: [
    CommonModule, 
    MatSlideToggleModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    MatOptionModule, 
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './team-admin.component.html',
  styleUrls: ['./team-admin.component.scss']
})
export class TeamAdminComponent implements OnInit, AfterViewInit {
  agencies = [
    {
      agencyName: 'Bizerte Agency',
      agencyCode: 'AG001',
      region: Region.Bizerte,
      city: BizerteCities.MenzelBourguiba,
      agencyContact: 'bizerte.contact@example.com',
      agentUsername: 'john.doe',
      active: true,
      agentEmail: 'john.doe@example.com',
      agentPhone: '123-456-7890'
    },
    {
      agencyName: 'Ariana Agency',
      agencyCode: 'AG002',
      region: Region.Ariana,
      city: ArianaCities.Ettadhamen,
      agencyContact: 'ariana.contact@example.com',
      agentUsername: 'jane.smith',
      active: false,
      agentEmail: 'jane.smith@example.com',
      agentPhone: '098-765-4321'
    }
    // Add more agencies as needed
  ];

  filteredAgencies = [...this.agencies]; // To store filtered agencies
  paginatedAgencies = [];  // Array to hold paginated data
  searchForm: FormGroup;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;  // Reference the paginator

  pageSize = 5;  // Default page size
  pageIndex = 0;  // Default page index

  regions = Object.values(Region);  // Available regions from the model
  availableCities: string[] = [];   // Dynamically populated based on region

  // To track the currently expanded row
  expandedAgentUsername: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize the form group with form controls
    this.searchForm = this.fb.group({
      globalSearch: [''],
      region: [''],
      city: ['']
    });

    // Listen for changes in the form and filter the table accordingly
    this.searchForm.valueChanges.subscribe(filters => {
      this.filterAgencies(filters);
    });

    // Initialize paginated data
    this.paginateAgencies();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.paginateAgencies();
    });
  }

  // Method to update city options based on selected region
  updateCitiesForRegion(region: Region): void {
    switch (region) {
      case Region.Bizerte:
        this.availableCities = Object.values(BizerteCities);
        break;
      case Region.Ariana:
        this.availableCities = Object.values(ArianaCities);
        break;
      // Add other regions and their corresponding cities here
      default:
        this.availableCities = [];
    }

    // Reset the city selection when region changes
    this.searchForm.patchValue({ city: '' });
  }

  // Method to filter agencies based on form input
  filterAgencies(filters: any): void {
    const { globalSearch, region, city } = filters;

    this.filteredAgencies = this.agencies.filter(agency => {
      const matchesGlobalSearch =
        agency.agencyName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        agency.agentUsername.toLowerCase().includes(globalSearch.toLowerCase()) ||
        agency.agencyCode.toLowerCase().includes(globalSearch.toLowerCase());

      const matchesRegion = region ? agency.region === region : true;
      const matchesCity = city ? agency.city === city : true;

      return matchesGlobalSearch && matchesRegion && matchesCity;
    });

    this.paginator.firstPage();  // Reset paginator when filters are applied
    this.paginateAgencies();     // Update paginated data
  }

  // Method to paginate the agencies data
  paginateAgencies(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAgencies = this.filteredAgencies.slice(start, end);
  }

  // Toggle activation status of an agency
  toggleActivation(agency: any): void {
    agency.active = !agency.active;
  }

  // Method to toggle row expansion
  toggleRowExpansion(agentUsername: string): void {
    if (this.expandedAgentUsername === agentUsername) {
      this.expandedAgentUsername = null; // Collapse if already expanded
    } else {
      this.expandedAgentUsername = agentUsername; // Expand the selected row
    }
  }
}

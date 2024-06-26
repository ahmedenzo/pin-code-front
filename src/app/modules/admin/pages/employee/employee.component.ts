
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeEditItemDialogComponent } from '../employee-modal-dialog/employee-edit-item-dialog.component';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  employeeForm: FormGroup;
  isEdit: boolean = false;
  searchText: string = '';
  showSuggestions: boolean = false;
  suggestions: any[] = [];
  searchTags: { category: string, value: string | number }[] = [];
  currentView: string = 'list';
  fields: { key: string, type: string }[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private employeeService: EmployeeService
  ) {
    this.employeeForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.employeeService.getAll().subscribe(
      db => {
        this.dataSource.data = db;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.setupForm();
        this.setupDisplayedColumns();
        this.setupFields(Object.keys(this.dataSource.data[0] || {}));
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  setupForm(): void {
    const formFields = Object.keys(this.dataSource.data[0] || {});
    formFields.forEach(field => {
      this.employeeForm.addControl(field, this.fb.control('', Validators.required));
    });
  }

  setupDisplayedColumns(): void {
    this.displayedColumns = Object.keys(this.dataSource.data[0] || []);
    if (!this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }
  }

  setupFields(dataSourceColumns: string[]): void {
    this.fields = dataSourceColumns.map(column => ({
      key: column,
      type: this.getFieldType(this.dataSource.data[0][column])
    }));
  }

  applyFilter(filterValue: string | Event): void {
    if (typeof filterValue === 'string') {
      this.searchText = filterValue;
    } else {
      this.searchText = (filterValue.target as HTMLInputElement).value;
    }
    this.showSuggestions = !!this.searchText;
    this.suggestions = this.getSuggestions(this.searchText);
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  getSuggestions(query: string): any[] {
    const categories = Object.keys(this.dataSource.data[0] || {});
    const suggestions = categories.map(category => {
      const results = this.dataSource.data
        .map(item => item[category])
        .filter(value => value != null && value.toString().toLowerCase().includes(query.toLowerCase()));

      if (results.length === 0) {
        return {
          category,
        results: [`Rechercher ${category} pour: ${query}`]
        };
      } else if (results.length === 1) {
        return {
          category,
          results
        };
      } else {
        return {
          category,
          results,
          expanded: false
        };
      }
    }).filter(suggestion => suggestion.results.length > 0);

    return suggestions;
  }

  toggleSuggestion(category: string): void {
    this.suggestions = this.suggestions.map(suggestion => {
      if (suggestion.category === category) {
        suggestion.expanded = !suggestion.expanded;
      }
      return suggestion;
    });
  }

  selectSuggestion(suggestion: { category: string, value: string | number }): void {
    if (!isNaN(Number(suggestion.value))) {
      suggestion.value = Number(suggestion.value);
    }
    this.searchTags.push(suggestion);
    this.searchText = '';
    this.applyFilter('');
    this.showSuggestions = false;
  }

  removeTag(index: number): void {
    this.searchTags.splice(index, 1);
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  setView(view: string): void {
    this.currentView = view;
  }

  addItem(): void {
    this.openDialog(false, {});
  }

  editItem(item: any): void {
    this.openDialog(true, item);
  }

  openDialog(isEdit: boolean, item: any): void {
    const dialogRef = this.dialog.open(EmployeeEditItemDialogComponent, {
      width: '400px',
      data: { isEdit, item, displayedColumns: this.displayedColumns, fields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEdit) {
          this.updateItem(result);
        } else {
          this.addNewItem(result);
        }
      }
    });
  }

  addNewItem(item: any): void {
    this.employeeService.create(item).subscribe(
      newItem => {
        this.dataSource.data.push(newItem);
        this.dataSource._updateChangeSubscription();
      },
      error => {
        console.error('Error adding new item:', error);
      }
    );
  }

  updateItem(item: any): void {
    this.employeeService.update(item.id, item).subscribe(
      updatedItem => {
        const index = this.dataSource.data.findIndex(i => i.id === item.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedItem;
          this.dataSource._updateChangeSubscription();
        }
      },
      error => {
        console.error('Error updating item:', error);
      }
    );
  }

  deleteItem(id: number): void {
    this.employeeService.delete(id).subscribe(
      () => {
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);
        this.dataSource._updateChangeSubscription();
      },
      error => {
        console.error('Error deleting item:', error);
      }
    );
  }

  getFieldType(value: any): string {
    if (typeof value === 'number') {
      return 'number';
    } else if (typeof value === 'boolean') {
      return 'checkbox';
    } else if (value instanceof Date) {
      return 'date';
    } else {
      return 'text';
    }
  }
}


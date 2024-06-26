
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
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
    FormsModule
  ],
  selector: 'app-ahmed-edit-item-dialog',
  templateUrl: './ahmed-edit-item-dialog.component.html',
})
export class AhmedEditItemDialogComponent implements OnInit {
  itemForm: FormGroup;
  fields: { key: string, type: string }[] = [];
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AhmedEditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data.isEdit;
  }

  ngOnInit(): void {
    const item = this.data.item || {};
    this.fields = this.data.fields;

    const group: any = {};
    this.fields.forEach(field => {
      group[field.key] = [item[field.key] || '', Validators.required];
    });
    this.itemForm = this.fb.group(group);
  }

  save(): void {
    if (this.itemForm.valid) {
      this.dialogRef.close(this.itemForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

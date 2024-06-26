import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
  <h2 mat-dialog-title>{{ data.isEdit ? 'Edit User' : 'Add User' }}</h2>
  <mat-dialog-content>
    <form [formGroup]="data.userForm" (ngSubmit)="onSubmit()">
      <div class="form-fields">
        <mat-form-field appearance="fill">
          <mat-label>ID</mat-label>
          <input matInput formControlName="id" [disabled]="data.isEdit" class="full-width">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" class="full-width">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Age</mat-label>
          <input matInput formControlName="age" class="full-width">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Salary</mat-label>
          <input matInput formControlName="salary" class="full-width">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" class="full-width">
        </mat-form-field>
      </div>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button (click)="onCancel()">Cancel</button>
    <button mat-raised-button color="primary" (click)="onSubmit()">Save</button>
  </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100px
    }
  `]
})
export class UserDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userForm: FormGroup, isEdit: boolean }
  ) {}

  onSubmit(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

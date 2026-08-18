import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { Employee } from '../../employee.service';

export interface EmployeeDialogData {
  employee: Employee | null; // null = add mode, otherwise edit mode
}

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.scss'
})
export class EmployeeDialogComponent {
  form: FormGroup;
  isEditMode: boolean;

  departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeDialogData
  ) {
    this.isEditMode = !!data?.employee;

    this.form = this.fb.group({
      name: [data?.employee?.name || '', [Validators.required]],
      email: [data?.employee?.email || '', [Validators.required, Validators.email]],
      department: [data?.employee?.department || '', [Validators.required]],
      position: [data?.employee?.position || '', [Validators.required]],
      salary: [data?.employee?.salary || null]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}

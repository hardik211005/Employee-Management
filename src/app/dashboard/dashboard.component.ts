import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NavbarComponent } from '../navbar/navbar.component';
import { EmployeeService, Employee } from '../employee.service';
import { EmployeeDialogComponent, EmployeeDialogData } from './employee-dialog/employee-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'department', 'position', 'salary', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (res) => {
        this.dataSource.data = res.employees;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load employees', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      data: { employee: null } as EmployeeDialogData
    });

    dialogRef.afterClosed().subscribe((formValue) => {
      if (!formValue) return;

      this.employeeService.createEmployee(formValue).subscribe({
        next: () => {
          this.snackBar.open('Employee added', 'Close', { duration: 2000 });
          this.loadEmployees();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to add employee';
          this.snackBar.open(msg, 'Close', { duration: 3000 });
        }
      });
    });
  }

  openEditDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      data: { employee } as EmployeeDialogData
    });

    dialogRef.afterClosed().subscribe((formValue) => {
      if (!formValue) return;

      this.employeeService.updateEmployee(employee.id, formValue).subscribe({
        next: () => {
          this.snackBar.open('Employee updated', 'Close', { duration: 2000 });
          this.loadEmployees();
        },
        error: () => {
          this.snackBar.open('Failed to update employee', 'Close', { duration: 3000 });
        }
      });
    });
  }

  deleteEmployee(employee: Employee): void {
    const confirmed = confirm(`Delete ${employee.name}? This can't be undone.`);
    if (!confirmed) return;

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.snackBar.open('Employee deleted', 'Close', { duration: 2000 });
        this.loadEmployees();
      },
      error: () => {
        this.snackBar.open('Failed to delete employee', 'Close', { duration: 3000 });
      }
    });
  }
}

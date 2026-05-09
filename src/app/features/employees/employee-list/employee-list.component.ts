import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  selectedDepartment: string = '';
  loading: boolean = false;
  error: string = '';
  deleteConfirm: { show: boolean; employeeId?: number | string; employeeName?: string } = { show: false };
  currentPage = 1;
  pageSize = 5;
  toast: { type: 'success'; message: string; visible: boolean } = { type: 'success', message: '', visible: false };
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.consumeQueuedToast();
    this.loadEmployees();
  }

  /**
   * Load all employees from API
   */
  loadEmployees(): void {
    this.loading = true;
    this.error = '';

    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.applyFilters();
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees. Please ensure JSON Server is running on port 3000.';
        console.error('Error loading employees:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Search employees by name or email
   */
  onSearch(): void {
    this.applyFilters();
    this.currentPage = 1;
  }

  onDepartmentFilter(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  logout(): void {
    this.authService.logout();
  }

  get totalPayroll(): number {
    return this.filteredEmployees.reduce((total, employee) => total + Number(employee.salary || 0), 0);
  }

  get averageSalary(): number {
    if (!this.filteredEmployees.length) {
      return 0;
    }

    return Math.round(this.totalPayroll / this.filteredEmployees.length);
  }

  get departmentCount(): number {
    return new Set(this.filteredEmployees.map(employee => employee.department)).size;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEmployees.length / this.pageSize));
  }

  get paginatedEmployees(): Employee[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  /**
   * Show delete confirmation dialog
   */
  showDeleteConfirm(employee: Employee): void {
    this.deleteConfirm = {
      show: true,
      employeeId: employee.id,
      employeeName: employee.name
    };
  }

  /**
   * Cancel delete operation
   */
  cancelDelete(): void {
    this.deleteConfirm = { show: false };
  }

  /**
   * Confirm and delete employee
   */
  confirmDelete(): void {
    if (this.deleteConfirm.employeeId === undefined) return;

    this.employeeService.deleteEmployee(this.deleteConfirm.employeeId).subscribe({
      next: () => {
        this.loadEmployees();
        this.deleteConfirm = { show: false };
        this.showToast('Employee deleted successfully.');
      },
      error: (err) => {
        this.error = 'Failed to delete employee';
        console.error('Error deleting employee:', err);
        this.deleteConfirm = { show: false };
      }
    });
  }

  /**
   * Format salary as currency
   */
  formatSalary(salary: number): string {
    return '₹' + salary.toLocaleString('en-IN');
  }

  /**
   * Get department badge color
   */
  getDepartmentBadgeClass(department: string): string {
    const deptMap: { [key: string]: string } = {
      'IT': 'bg-primary',
      'HR': 'bg-success',
      'Sales': 'bg-warning',
      'Marketing': 'bg-info',
      'Finance': 'bg-danger'
    };
    return deptMap[department] || 'bg-secondary';
  }

  getStatusClass(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'Active': 'status-active',
      'On Leave': 'status-leave',
      'Probation': 'status-probation',
      'Inactive': 'status-inactive'
    };
    return statusMap[status || 'Active'] || 'status-active';
  }

  getInitials(name: string): string {
    const parts = (name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return 'EM';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  get departmentOptions(): string[] {
    return Array.from(new Set(this.employees.map(employee => employee.department))).sort();
  }

  dismissToast(): void {
    this.toast.visible = false;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }

  private applyFilters(): void {
    const searchLower = this.searchTerm.trim().toLowerCase();

    this.filteredEmployees = this.employees.filter(employee => {
      const matchesName = !searchLower || employee.name.toLowerCase().includes(searchLower);
      const matchesDepartment = !this.selectedDepartment || employee.department === this.selectedDepartment;
      return matchesName && matchesDepartment;
    });
  }

  private consumeQueuedToast(): void {
    const queuedToast = sessionStorage.getItem('ems-toast');

    if (!queuedToast) {
      return;
    }

    sessionStorage.removeItem('ems-toast');
    this.showToast(queuedToast);
  }

  private showToast(message: string): void {
    this.toast = {
      type: 'success',
      message,
      visible: true
    };

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.toast.visible = false;
      this.toastTimeoutId = null;
    }, 2800);
  }
}

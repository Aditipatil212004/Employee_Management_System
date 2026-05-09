import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  successMessage = '';
  departments = ['IT', 'HR', 'Sales', 'Marketing', 'Finance'];
  roles = ['Software Engineer', 'HR Executive', 'Sales Manager', 'Marketing Specialist', 'Finance Analyst', 'Team Lead'];
  statuses = ['Active', 'On Leave', 'Probation', 'Inactive'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize add employee form with validation
   */
  initializeForm(): void {
    this.employeeForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      department: [
        '',
        [Validators.required]
      ],
      salary: [
        '',
        [
          Validators.required,
          Validators.min(10000),
          Validators.max(500000),
          Validators.pattern(/^\d+$/)
        ]
      ],
      joiningDate: [
        '',
        [Validators.required]
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],
      address: [
        '',
        [
          Validators.required,
          Validators.minLength(5)
        ]
      ],
      role: [
        '',
        [Validators.required]
      ],
      status: [
        'Active',
        [Validators.required]
      ]
    });
  }

  /**
   * Get form controls for template
   */
  get f() {
    return this.employeeForm.controls;
  }

  get previewInitials(): string {
    const name = this.employeeForm?.value?.name || '';
    const parts = name
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

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';

    // Stop if form is invalid
    if (this.employeeForm.invalid) {
      return;
    }

    this.loading = true;

    const newEmployee: Employee = {
      name: this.employeeForm.value.name,
      email: this.employeeForm.value.email,
      department: this.employeeForm.value.department,
      salary: Number(this.employeeForm.value.salary),
      joiningDate: this.employeeForm.value.joiningDate,
      phone: this.employeeForm.value.phone,
      address: this.employeeForm.value.address,
      role: this.employeeForm.value.role,
      status: this.employeeForm.value.status
    };

    this.employeeService.createEmployee(newEmployee).subscribe({
      next: (response) => {
        this.loading = false;
        sessionStorage.setItem('ems-toast', `${response.name} added successfully.`);
        this.router.navigate(['/dashboard/employees']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to add employee. Please try again.';
        console.error('Error adding employee:', err);
      }
    });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.employeeForm.reset();
    this.submitted = false;
    this.error = '';
    this.successMessage = '';
  }

  /**
   * Navigate back to employee list
   */
  goBack(): void {
    this.router.navigate(['/dashboard/employees']);
  }
}

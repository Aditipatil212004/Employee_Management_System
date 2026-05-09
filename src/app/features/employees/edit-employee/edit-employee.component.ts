import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {

  employeeForm!: FormGroup;
  currentEmployee: Employee | null = null;

  submitted = false;
  loading = false;
  formLoading = true;

  successMessage = '';
  error = '';

  employeeId!: number | string;

  departments = [
    'IT',
    'HR',
    'Finance',
    'Marketing',
    'Sales'
  ];
  roles = ['Software Engineer', 'HR Executive', 'Sales Manager', 'Marketing Specialist', 'Finance Analyst', 'Team Lead'];
  statuses = ['Active', 'On Leave', 'Probation', 'Inactive'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.employeeForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
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
        Validators.required
      ],

      salary: [
        '',
        [
          Validators.required,
          Validators.min(10000)
        ]
      ],
      joiningDate: [''],
      phone: [''],
      address: [''],
      role: [''],
      status: ['Active']
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.employeeId = id;
      this.loadEmployee();
    } else {
      this.error = 'Employee id is missing';
      this.formLoading = false;
    }
  }

  get f() {
    return this.employeeForm.controls;
  }

  loadEmployee(): void {

    this.employeeService
      .getEmployeeById(this.employeeId)
      .subscribe({

        next: (employee: Employee) => {
          this.currentEmployee = employee;

          this.employeeForm.patchValue({
            name: employee.name,
            email: employee.email,
            department: employee.department,
            salary: employee.salary,
            joiningDate: employee.joiningDate || '',
            phone: employee.phone || '',
            address: employee.address || '',
            role: employee.role || '',
            status: employee.status || 'Active'
          });

          this.formLoading = false;
        },

        error: () => {
          this.error = 'Failed to load employee data';
          this.formLoading = false;
        }
      });
  }

  onSubmit(): void {

    this.submitted = true;

    if (this.employeeForm.invalid) {
      return;
    }

    this.loading = true;

    const updatedEmployee: Employee = {
      ...(this.currentEmployee || {}),
      ...this.employeeForm.value,
      id: this.employeeId,
      salary: Number(this.employeeForm.value.salary)
    };

    this.employeeService
      .updateEmployee(
        this.employeeId,
        updatedEmployee
      )
      .subscribe({

        next: () => {
          this.loading = false;
          sessionStorage.setItem('ems-toast', 'Employee updated successfully.');
          this.router.navigate(['/dashboard/employees']);
        },

        error: () => {

          this.error = 'Failed to update employee';

          this.loading = false;
        }
      });
  }

  resetForm(): void {
    this.loadEmployee();
    this.submitted = false;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/employees']);
  }
}

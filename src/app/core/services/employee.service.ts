import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private employees: Employee[] = [

    {
      id: 1,
      name: 'Aditi Patil',
      email: 'aditi@gmail.com',
      department: 'IT',
      salary: 50000
    },

    {
      id: 2,
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      department: 'HR',
      salary: 45000
    },

    {
      id: 3,
      name: 'Priya Verma',
      email: 'priya@gmail.com',
      department: 'Finance',
      salary: 60000
    },

    {
      id: 4,
      name: 'Aman Gupta',
      email: 'aman@gmail.com',
      department: 'Marketing',
      salary: 55000
    }
  ];

  constructor() {}

  /**
   * Get all employees
   */
  getEmployees(): Observable<Employee[]> {

    return of(this.employees);
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(
    id: number | string
  ): Observable<Employee> {

    const employee = this.employees.find(
      emp => emp.id == Number(id)
    );

    return of(employee as Employee);
  }

  /**
   * Create new employee
   */
  createEmployee(
    employee: Employee
  ): Observable<Employee> {

    employee.id = this.employees.length + 1;

    this.employees.push(employee);

    return of(employee);
  }

  /**
   * Update employee
   */
  updateEmployee(
    id: number | string,
    updatedEmployee: Employee
  ): Observable<Employee> {

    const index = this.employees.findIndex(
      emp => emp.id == Number(id)
    );

    if (index !== -1) {

      this.employees[index] = {
        ...updatedEmployee,
        id: Number(id)
      };
    }

    return of(updatedEmployee);
  }

  /**
   * Delete employee
   */
  deleteEmployee(
    id: number | string
  ): Observable<void> {

    this.employees = this.employees.filter(
      emp => emp.id != Number(id)
    );

    return of();
  }

  /**
   * Search employees
   */
  searchEmployees(
    searchTerm: string
  ): Observable<Employee[]> {

    const filteredEmployees =
      this.employees.filter(employee =>

        employee.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        ||

        employee.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    return of(filteredEmployees);
  }
}
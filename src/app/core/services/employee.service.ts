import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  of,
  catchError,
  tap,
  map
} from 'rxjs';

import { Employee } from '../models/employee.model';

const STORAGE_KEY = 'employee-management-data';

const DEFAULT_EMPLOYEES: Employee[] = [

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

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = 'http://localhost:3000/employees';

  constructor(private http: HttpClient) {}

  /**
   * Get All Employees
   */
  getEmployees(): Observable<Employee[]> {

    return this.http
      .get<Employee[]>(this.apiUrl)
      .pipe(

        tap((employees) => {
          this.saveLocalEmployees(employees);
        }),

        catchError(() => {

          return of(this.getLocalEmployees());
        })
      );
  }

  /**
   * Get Employee By ID
   */
  getEmployeeById(
    id: number | string
  ): Observable<Employee> {

    return this.http
      .get<Employee>(`${this.apiUrl}/${id}`)
      .pipe(

        catchError(() => {

          const employee =
            this.getLocalEmployees().find(
              emp => emp.id == Number(id)
            );

          return of(employee as Employee);
        })
      );
  }

  /**
   * Add Employee
   */
  createEmployee(
    employee: Employee
  ): Observable<Employee> {

    return this.http
      .post<Employee>(
        this.apiUrl,
        employee
      )
      .pipe(

        catchError(() => {

          return of(
            this.createLocalEmployee(employee)
          );
        })
      );
  }

  /**
   * Update Employee
   */
  updateEmployee(
    id: number | string,
    employee: Employee
  ): Observable<Employee> {

    return this.http
      .put<Employee>(
        `${this.apiUrl}/${id}`,
        employee
      )
      .pipe(

        catchError(() => {

          return of(
            this.updateLocalEmployee(
              Number(id),
              employee
            )
          );
        })
      );
  }

  /**
   * Delete Employee
   */
  deleteEmployee(
    id: number | string
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(

        catchError(() => {

          this.deleteLocalEmployee(
            Number(id)
          );

          return of(undefined);
        }),

        map(() => undefined)
      );
  }

  /**
   * Search Employees
   */
  searchEmployees(
    searchTerm: string
  ): Observable<Employee[]> {

    const employees =
      this.getLocalEmployees();

    const filteredEmployees =
      employees.filter(employee =>

        employee.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        ||

        employee.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        ||

        employee.department
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    return of(filteredEmployees);
  }

  /**
   * Get Local Employees
   */
  private getLocalEmployees(): Employee[] {

    const storedEmployees =
      localStorage.getItem(STORAGE_KEY);

    if (!storedEmployees) {

      this.saveLocalEmployees(
        DEFAULT_EMPLOYEES
      );

      return DEFAULT_EMPLOYEES;
    }

    return JSON.parse(storedEmployees);
  }

  /**
   * Save Local Employees
   */
  private saveLocalEmployees(
    employees: Employee[]
  ): void {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(employees)
    );
  }

  /**
   * Create Local Employee
   */
  private createLocalEmployee(
    employee: Employee
  ): Employee {

    const employees =
      this.getLocalEmployees();

    const ids = employees.map(
      emp => Number(emp.id) || 0
    );

    const maxId =
      ids.length > 0
        ? Math.max(...ids)
        : 0;

    const newEmployee = {
      ...employee,
      id: maxId + 1
    };

    employees.unshift(newEmployee);

    this.saveLocalEmployees(
      employees
    );

    return newEmployee;
  }

  /**
   * Update Local Employee
   */
  private updateLocalEmployee(
    id: number,
    employee: Employee
  ): Employee {

    const updatedEmployee = {
      ...employee,
      id
    };

    const employees =
      this.getLocalEmployees().map(
        emp => emp.id === id
          ? updatedEmployee
          : emp
      );

    this.saveLocalEmployees(
      employees
    );

    return updatedEmployee;
  }

  /**
   * Delete Local Employee
   */
  private deleteLocalEmployee(
    id: number
  ): void {

    const employees =
      this.getLocalEmployees().filter(
        employee => employee.id !== id
      );

    this.saveLocalEmployees(
      employees
    );
  }
}
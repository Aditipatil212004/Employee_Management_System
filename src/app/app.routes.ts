import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'add-employee',
        loadComponent: () => import('./features/employees/add-employee/add-employee.component').then(m => m.AddEmployeeComponent),
        canActivate: [authGuard]
      },
      {
        path: 'edit-employee/:id',
        loadComponent: () => import('./features/employees/edit-employee/edit-employee.component').then(m => m.EditEmployeeComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

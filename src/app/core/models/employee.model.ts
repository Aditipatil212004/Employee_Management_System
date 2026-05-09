export interface Employee {
  id?: number | string;
  name: string;
  email: string;
  department: string;
  salary: number;
  joiningDate?: string;
  phone?: string;
  address?: string;
  role?: string;
  status?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

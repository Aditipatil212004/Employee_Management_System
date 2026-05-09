import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

export interface PieSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
  colorLight: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CountUpDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  error = '';
  pieSegments: PieSegment[] = [];
  hoveredSegment: number | null = null;
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.calculatePieSegments();
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard data';
        this.loading = false;
      }
    });
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get totalDepartments(): number {
    return new Set(this.employees.map(employee => employee.department)).size;
  }

  get averageSalary(): number {
    if (!this.employees.length) {
      return 0;
    }

    return Math.round(this.totalSalary / this.employees.length);
  }

  get highestSalary(): number {
    return Math.max(0, ...this.employees.map(employee => Number(employee.salary || 0)));
  }

  get activeEmployees(): number {
    return this.employees.filter(employee => (employee.status || 'Active') === 'Active').length;
  }

  get activeRate(): number {
    if (!this.totalEmployees) {
      return 0;
    }

    return Math.round((this.activeEmployees / this.totalEmployees) * 100);
  }

  get newEmployees(): number {
    const now = new Date();
    return this.employees.filter(employee => {
      if (!employee.joiningDate) {
        return false;
      }

      const joined = new Date(employee.joiningDate);
      const diffDays = (now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;
  }

  get totalSalary(): number {
    return this.employees.reduce((total, employee) => total + Number(employee.salary || 0), 0);
  }

  get recentEmployees(): Employee[] {
    return [...this.employees].slice(-5).reverse();
  }

  get activityItems(): string[] {
    return this.recentEmployees.map(employee => `${employee.name} was added to ${employee.department}`);
  }

  formatSalary(salary: number): string {
    return 'INR ' + Number(salary || 0).toLocaleString('en-IN');
  }

  departmentShare(department: string): number {
    if (!this.employees.length) {
      return 0;
    }

    const count = this.departmentCount(department);
    return Math.round((count / this.employees.length) * 100);
  }

  departmentCount(department: string): number {
    return this.employees.filter(employee => employee.department === department).length;
  }

  get departments(): string[] {
    return Array.from(new Set(this.employees.map(employee => employee.department)));
  }

  calculatePieSegments(): void {
    if (this.departments.length === 0) {
      this.pieSegments = [];
      return;
    }

    const premiumColors = [
      { main: '#0f172a', light: '#334155' },
      { main: '#0f766e', light: '#14b8a6' },
      { main: '#115e59', light: '#2dd4bf' },
      { main: '#334155', light: '#64748b' },
      { main: '#0d9488', light: '#5eead4' },
      { main: '#134e4a', light: '#99f6e4' },
      { main: '#475569', light: '#94a3b8' },
      { main: '#0f766e', light: '#ccfbf1' }
    ];

    this.pieSegments = this.departments.map((dept, index) => {
      const count = this.departmentCount(dept);
      const percentage = this.departmentShare(dept);
      const colorScheme = premiumColors[index % premiumColors.length];

      return {
        label: dept,
        value: percentage,
        percentage,
        color: colorScheme.main,
        colorLight: colorScheme.light,
        count
      };
    });
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  getSegmentPath(index: number): string {
    if (this.pieSegments.length === 0) {
      return '';
    }

    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (this.pieSegments[i].percentage / 100) * 360;
    }

    const endAngle = startAngle + (this.pieSegments[index].percentage / 100) * 360;
    return this.getDonutPath(startAngle, endAngle, 86, 52);
  }

  getDonutPath(startAngle: number, endAngle: number, outerRadius: number, innerRadius: number): string {
    const outerStart = this.polarToCartesian(100, 100, outerRadius, endAngle);
    const outerEnd = this.polarToCartesian(100, 100, outerRadius, startAngle);
    const innerStart = this.polarToCartesian(100, 100, innerRadius, endAngle);
    const innerEnd = this.polarToCartesian(100, 100, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', outerStart.x, outerStart.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  }

  isSegmentHovered(index: number): boolean {
    return this.hoveredSegment === index;
  }

  onSegmentHover(index: number | null): void {
    this.hoveredSegment = index;
    this.tooltipVisible = index !== null;
  }

  onSegmentMove(event: MouseEvent, chartBounds: DOMRect): void {
    const offset = 18;
    const padding = 12;
    const nextX = event.clientX - chartBounds.left + offset;
    const nextY = event.clientY - chartBounds.top - offset;

    this.tooltipX = Math.min(Math.max(nextX, padding), chartBounds.width - 180);
    this.tooltipY = Math.min(Math.max(nextY, padding), chartBounds.height - 90);
  }

  resetPieSegments(): void {
    this.pieSegments = [];
  }

  get activeSegment(): PieSegment | null {
    if (this.hoveredSegment === null) {
      return null;
    }

    return this.pieSegments[this.hoveredSegment] ?? null;
  }

  get topDepartment(): string {
    if (!this.departments.length) {
      return 'No data';
    }

    return this.departments
      .map(department => ({
        department,
        count: this.departmentCount(department)
      }))
      .sort((a, b) => b.count - a.count)[0].department;
  }

  departmentColor(index: number): string {
    const colors = ['#0f172a', '#0f766e', '#115e59', '#334155', '#0d9488', '#134e4a', '#475569', '#14b8a6'];
    return colors[index % colors.length];
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
}

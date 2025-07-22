// Core type definitions for the Travel Desk Management System

export type UserRole = 'Admin' | 'TravelAdmin' | 'Manager' | 'Employee';

export type BookingType = 'air-ticket-only' | 'hotel-only' | 'both';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'disapproved'
  | 'booked'
  | 'completed'
  | 'returned';

export type RequestAction =
  | 'approve'
  | 'disapprove'
  | 'return-to-employee'
  | 'return-to-manager'
  | 'book'
  | 'complete';

export interface User {
  userId: number;
  firstName: string;
  lastName?: string;
  email: string;
  mobileNum: string;
  address: string;
  roleId: number;
  role?: Role;
  departmentId: number;
  department?: Department;
  managerId?: number;
  manager?: User;
  isActive: boolean;
  createdOn: Date;
  modifiedOn?: Date;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface Project {
  projectId: number;
  projectName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

import React from 'react';

// Core type definitions for the Travel Desk Management System
// Aligned with backend models exactly

// User and authentication types (matches backend User.cs exactly)
export interface User {
  userId: number;
  firstName: string;
  lastName?: string; // Nullable in backend
  address: string;
  email: string;
  mobileNum: string; // Matches backend MobileNum
  password: string;
  roleId: number;
  role?: Role;
  departmentId: number;
  department?: Department;
  managerId?: number; // Nullable in backend
  manager?: User;
  createdBy: number;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn?: string;
  isActive: boolean;
}

// Login credentials (matches backend LoginModel.cs)
export interface LoginCredentials {
  email: string;
  password: string;
}

// Login response (matches backend LoginController.cs response)
export interface LoginResponse {
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// User roles (matches backend Role.cs RoleName values)
export type UserRole = 'Admin' | 'TravelAdmin' | 'Manager' | 'Employee';

// Department types aligned with backend Department.cs
export interface Department {
  departmentId: number;
  departmentName: string;
  createdBy: number;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn?: string;
  isActive: boolean;
  // Extended properties for UI
  userCount?: number;
  projectCount?: number;
}

export interface DepartmentCreateRequest {
  departmentName: string;
  createdBy: number;
  isActive?: boolean;
}

export interface DepartmentUpdateRequest {
  departmentName?: string;
  modifiedBy?: string;
  isActive?: boolean;
}

// Project types (matches backend Project.cs)
export interface Project {
  projectId: number;
  projectName: string;
  createdBy: number;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn?: string;
  isActive: boolean;
}

export interface ProjectCreateData {
  projectName: string;
  createdBy: number;
  isActive?: boolean;
}

export interface ProjectUpdateData {
  projectName?: string;
  modifiedBy?: string;
  isActive?: boolean;
}

// Role types (matches backend Role.cs exactly)
export interface Role {
  roleId: number;
  roleName: string; // Matches backend RoleName
  createdBy: number;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn?: string;
  isActive: boolean;
  // Extended properties for UI
  userCount?: number;
}

export interface RoleCreateData {
  roleName: string;
  createdBy: number;
  isActive?: boolean;
}

export interface RoleUpdateData {
  roleName?: string;
  modifiedBy?: string;
  isActive?: boolean;
}

// Travel Request types (matches backend DTO structure exactly)
export interface TravelRequest extends Record<string, unknown> {
  travelRequestId: number;
  user: User; // Matches backend DTO structure
  project: Project; // Matches backend DTO structure
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  comments?: string;
  createdOn?: string; // Optional since backend DTO doesn't include it
}

// Request action types for manager operations
export type RequestAction = 'approve' | 'reject' | 'return-to-employee';

// Request status types (matches backend status values exactly)
export type RequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Booked'
  | 'Returned to Employee'
  | 'Completed';

// Travel Request DTOs for API responses (matches backend DTOs exactly)
export interface TravelRequestDto {
  travelRequestId: number;
  user: UserDto;
  project: ProjectDto;
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  comments?: string;
}

export interface UserDto {
  userId: number;
  firstName: string;
  lastName?: string; // Matches backend nullable LastName
  department: DepartmentDto;
}

export interface DepartmentDto {
  departmentId: number;
  departmentName: string;
}

export interface ProjectDto {
  projectId: number;
  projectName: string;
}

export interface RoleDto {
  roleId: number;
  roleName: string;
}

export interface DashboardDto {
  totalRequests: number;
  pendingRequests: number;
  totalUsers: number;
  totalDepartments: number;
  totalProjects: number;
  requests: TravelRequestDto[];
}

export interface CommentDto {
  comments: string;
}

export interface BookingDetails {
  comments: string;
  ticketUrl?: string;
}

// Travel Request creation data (matches backend POST endpoint)
export interface TravelRequestCreateData {
  userId: number;
  projectId: number;
  departmentId: number;
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  createdOn: string;
  isActive: boolean;
}

// Table and UI types
export interface TableColumn<T> {
  key: string;
  title: React.ReactNode;
  sortable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: string | number | boolean, item: T) => React.ReactNode;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  totalCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  details?: string[];
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Dashboard types
export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
  rejectedRequests: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
}

// Export all types
export * from './table';
export * from './api';

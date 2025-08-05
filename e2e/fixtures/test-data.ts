import type { UserRole } from '../../src/types';

export interface TestUser {
  email: string;
  password: string;
  role: {
    roleName: UserRole;
  };
}

export const testUsers: TestUser[] = [
  {
    email: 'employee@company.com',
    password: 'employee123',
    role: { roleName: 'Employee' },
  },
  {
    email: 'manager@company.com',
    password: 'manager123',
    role: { roleName: 'Manager' },
  },
  {
    email: 'admin@company.com',
    password: 'admin123',
    role: { roleName: 'Admin' },
  },
  {
    email: 'traveladmin@company.com',
    password: 'traveladmin123',
    role: { roleName: 'TravelAdmin' },
  },
];

export const mockTravelRequest = {
  travelRequestId: 1,
  userId: 1,
  projectId: 1,
  departmentId: 1,
  reasonForTravel: 'Business meeting',
  fromDate: '2024-03-15T00:00:00Z',
  toDate: '2024-03-20T00:00:00Z',
  fromLocation: 'San Francisco',
  toLocation: 'New York',
  status: 'Pending',
  createdOn: '2024-03-10T00:00:00Z',
  isActive: true,
};

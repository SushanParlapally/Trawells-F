import type { User, Project } from '.';

export interface TravelRequest {
  travelRequestId: number;
  user: User; // Changed from optional to required to match backend
  project: Project; // Changed from optional to required to match backend
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  status: TravelRequestStatus;
  comments?: string; // Matches backend Comments
  ticketUrl?: string; // Matches backend TicketUrl
  createdOn: string;
  modifiedOn?: string;
  isActive: boolean;
}

// Updated to match backend status values exactly
export type TravelRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Booked'
  | 'Returned to Employee'
  | 'Completed';

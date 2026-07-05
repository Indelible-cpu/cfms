export type Role = 'Administrator' | 'Forestry Officer' | 'Village Forest Committee' | 'Community Member';

export type UserProfile = {
  uid: string;
  role: Role;
  name: string;
  village?: string;
  email?: string;
  phone?: string;
};

export type ForestRecord = {
  id?: string;
  name: string;
  code: string;
  village: string;
  district: string;
  size?: string;
  gps?: string;
  description?: string;
  status: 'Active' | 'Protected' | 'Under Review';
  createdAt?: unknown;
};

export type PlantingRecord = {
  id?: string;
  plantingDate: string;
  village: string;
  species: string;
  count: number;
  group: string;
  notes?: string;
  status?: string;
  createdAt?: unknown;
};

export type IncidentRecord = {
  id?: string;
  incidentDate: string;
  village: string;
  type: string;
  description: string;
  status: 'New' | 'Under Investigation' | 'Resolved';
  createdAt?: unknown;
};

export type PermitRecord = {
  id?: string;
  permitNumber: string;
  requestType: string;
  village: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: unknown;
};

export type VillageRecord = {
  id?: string;
  name: string;
  authority: string;
  district: string;
  population?: string;
  createdAt?: unknown;
};

export type WorkOpportunity = {
  id?: string;
  title: string;
  type: string;
  description: string;
  village: string;
  date: string;
  startTime: string;
  endTime: string;
  requiredParticipants: number;
  coordinator: string;
  status: 'Open' | 'Closed' | 'Completed';
  createdAt?: unknown;
};

export type WorkRegistration = {
  id?: string;
  opportunityId: string;
  name: string;
  phone: string;
  village: string;
  gender?: string;
  ageGroup: string;
  availability: string;
  registrationNumber: string;
  attendance?: 'Present' | 'Absent';
  createdAt?: unknown;
};

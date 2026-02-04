
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected'
}

export enum BusinessType {
  MEDICAL = 'medical',
  SPORTS = 'sports',
  BEAUTY = 'beauty',
  EDUCATION = 'education',
  OTHER = 'other'
}

export interface ProviderNotifications {
  pushEnabled: boolean;
  notifyOnNew: boolean;
  notifyOnStatusChange: boolean;
}

export interface RecurringSlot {
  id: string;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface Provider {
  id: string;
  name: string;
  businessName: string;
  businessType: BusinessType;
  slug: string;
  email: string;
  trialEndDate: string;
  isActive: boolean;
  logoUrl?: string;
  headerColor?: string;
  notifications?: ProviderNotifications;
  recurringSlots?: RecurringSlot[];
}

export interface Appointment {
  id: string;
  providerId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  note?: string;
  status: AppointmentStatus;
  createdAt: string;
  reminderSent?: boolean;
}

export interface User {
  id: string;
  role: 'admin' | 'provider';
  providerId?: string;
  name: string;
  email: string;
}

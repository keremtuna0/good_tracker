export type Role = 'borrower' | 'staff';
export type EquipmentStatus = 'available' | 'borrowed' | 'maintenance';
export type ReservationStatus =
  | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // for DEMO acc's
  role: Role;
}

export interface Equipment {
  id: string;          
  name: string;
  category: string;
  lab: string;
  location: string;
  description: string;
  status: EquipmentStatus;
  availableFrom?: string;
}

export interface Reservation {
  id: string;
  equipmentId: string;
  userId: string;
  date: string;        // YYYY-MM-DD
  startHour: number;   // 13 = 13:00
  endHour: number;     // 15 = 15:00
  status: ReservationStatus;
  note?: string;       
}
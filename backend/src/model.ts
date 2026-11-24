export type Role = 'borrower' | 'staff';
export type EquipmentStatus = 'available' | 'borrowed' | 'maintenance';
export type ReservationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';
export interface User {
  id: string;
  name: string;
  email: string;
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
}
export interface BookingInput {
  equipmentId: string;
  date: string;
  startHour: number;
  endHour: number;
}
export interface Reservation extends BookingInput {
  id: string;
  userId: string;
  status: ReservationStatus;
  createdAt: string;
  note?: string;
  noteDetails?: string;
  handledBy?: string;
  handledAt?: string;
  borrowerName?: string;
  borrowerEmail?: string;
}
export type BusySlot = Pick<
  Reservation,
  'id' | 'equipmentId' | 'date' | 'startHour' | 'endHour'
>;
export interface Actor {
  user: User;
  token: string;
}
export interface Session {
  accessToken: string;
  expiresAt: string;
  user: User;
}
export type Transition = 'approve' | 'reject' | 'cancel';
export interface Store {
  mode: 'demo' | 'supabase';
  signIn(email: string, password: string): Promise<Session>;
  authenticate(token: string): Promise<Actor>;
  signOut(actor: Actor): Promise<void>;
  equipment(actor: Actor): Promise<Equipment[]>;
  saveEquipment(
    actor: Actor,
    input: Equipment,
    create: boolean
  ): Promise<Equipment>;
  reservations(actor: Actor): Promise<Reservation[]>;
  availability(actor: Actor): Promise<BusySlot[]>;
  reserve(actor: Actor, input: BookingInput): Promise<Reservation>;
  transition(
    actor: Actor,
    id: string,
    action: Transition,
    note: string,
    details: string
  ): Promise<Reservation>;
}

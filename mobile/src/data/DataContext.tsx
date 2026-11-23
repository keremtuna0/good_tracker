import { createContext, ReactNode, useContext, useState } from 'react';
import { Equipment, Reservation } from '../types';
import { equipment as initialEquipment, reservations as initialReservations } from './sampleData';

export const overlaps = (a: Reservation, b: Reservation) =>
  a.equipmentId === b.equipmentId && a.date === b.date &&
  a.startHour < b.endHour && b.startHour < a.endHour;

type NewReservation = {
  equipmentId: string;
  userId: string;
  date: string;
  startHour: number;
  endHour: number;
};

type AddResult = { ok: true } | { ok: false; conflict: Reservation };

interface DataValue {
  equipment: Equipment[];
  reservations: Reservation[];
  addReservation: (input: NewReservation) => AddResult;
  cancelReservation: (id: string) => void;
  approveRequest: (id: string, staffName: string) => Reservation[];
  rejectRequest: (id: string, staffName: string, reason: string, details: string) => Reservation[];
  restore: (snapshot: Reservation[]) => void;
}

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [equipment] = useState<Equipment[]>(initialEquipment);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  // If there is alredy a reservation do not make it possible to requre any new
  const addReservation = (input: NewReservation): AddResult => {
    const draft: Reservation = { id: `r${Date.now()}`, status: 'pending', requestedAgo: 'Just now', ...input };
    const conflict = reservations.find((r) => r.status === 'approved' && overlaps(r, draft));
    if (conflict) return { ok: false, conflict };
    setReservations([...reservations, draft]);
    return { ok: true };
  };

  const cancelReservation = (id: string) =>
    setReservations(reservations.map((r): Reservation => (r.id === id ? { ...r, status: 'cancelled' } : r)));

  // When accepted deny all other reservation otomaticly
  const approveRequest = (id: string, staffName: string) => {
    const snapshot = reservations;
    const target = reservations.find((r) => r.id === id);
    if (!target) return snapshot;
    setReservations(
      reservations.map((r): Reservation => {
        if (r.id === id) return { ...r, status: 'approved', handledBy: staffName, handledAt: 'Just now' };
        if (r.status === 'pending' && overlaps(r, target))
          return { ...r, status: 'rejected', note: 'Slot given to another request', handledBy: staffName, handledAt: 'Just now' };
        return r;
      })
    );
    return snapshot;
  };

  const rejectRequest = (id: string, staffName: string, reason: string, details: string) => {
    const snapshot = reservations;
    setReservations(
      reservations.map((r): Reservation =>
        r.id === id
          ? { ...r, status: 'rejected', note: reason, noteDetails: details.trim() || undefined, handledBy: staffName, handledAt: 'Just now' }
          : r
      )
    );
    return snapshot;
  };

  const restore = (snapshot: Reservation[]) => setReservations(snapshot);

  return (
    <DataContext.Provider
      value={{ equipment, reservations, addReservation, cancelReservation, approveRequest, rejectRequest, restore }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Equipment, Reservation } from '../types';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';

export const overlaps = (a: Reservation, b: Reservation) =>
  a.equipmentId === b.equipmentId &&
  a.date === b.date &&
  a.startHour < b.endHour &&
  b.startHour < a.endHour;
type NewReservation = Pick<
  Reservation,
  'equipmentId' | 'date' | 'startHour' | 'endHour'
>;
type BusySlot = Pick<
  Reservation,
  'id' | 'equipmentId' | 'date' | 'startHour' | 'endHour'
>;
interface DataValue {
  equipment: Equipment[];
  reservations: Reservation[];
  busySlots: BusySlot[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addReservation: (input: NewReservation) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, reason: string, details: string) => Promise<void>;
  saveEquipment: (item: Equipment, create: boolean) => Promise<void>;
}
const DataContext = createContext<DataValue | undefined>(undefined);
export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    if (!user) return;
    const owner = generation.current,
      request = ++sequence.current;
    setLoading(true);
    try {
      const [items, rows, busy] = await Promise.all([
        api.request<Equipment[]>('/equipment'),
        api.request<Reservation[]>('/reservations'),
        api.request<BusySlot[]>('/availability'),
      ]);
      if (owner !== generation.current || request !== sequence.current) return;
      setEquipment(items);
      setReservations(rows);
      setBusySlots(busy);
      setError('');
    } catch (e) {
      if (owner === generation.current && request === sequence.current)
        setError(e instanceof Error ? e.message : 'Could not load data.');
    } finally {
      if (owner === generation.current && request === sequence.current)
        setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    generation.current++;
    setEquipment([]);
    setReservations([]);
    setBusySlots([]);
    setError('');
    setLoading(false);
    if (!user) return;
    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 10000);
    return () => {
      generation.current++;
      clearInterval(interval);
    };
  }, [user, refresh]);
  const mutate = async (path: string, method: string, body?: unknown) => {
    await api.request(path, method, body);
    await refresh();
  };
  return (
    <DataContext.Provider
      value={{
        equipment,
        reservations,
        busySlots,
        loading,
        error,
        refresh,
        addReservation: (input) => mutate('/reservations', 'POST', input),
        cancelReservation: (id) => mutate(`/reservations/${id}/cancel`, 'POST'),
        approveRequest: (id) => mutate(`/reservations/${id}/approve`, 'POST'),
        rejectRequest: (id, note, details) =>
          mutate(`/reservations/${id}/reject`, 'POST', { note, details }),
        saveEquipment: (item, create) =>
          mutate(
            create ? '/equipment' : `/equipment/${encodeURIComponent(item.id)}`,
            create ? 'POST' : 'PATCH',
            item
          ),
      }}
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

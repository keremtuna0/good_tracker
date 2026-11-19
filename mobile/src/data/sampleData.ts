import { Equipment, Reservation, User } from '../types';

export const users: User[] = [
  { id: 'u1', name: 'User01', email: 'borrower@demo.test', password: 'demo1234', role: 'borrower' },
  { id: 'u2', name: 'User02', email: 'borrower2@demo.test', password: 'demo1234', role: 'borrower' },
  { id: 's1', name: 'Staff01', email: 'staff@demo.test', password: 'demo1234', role: 'staff' },
];

export const equipment: Equipment[] = [
  { id: 'EQ-104', name: 'USB-C to HDMI 4K Adapter', category: 'Adapters', lab: 'Lab B-204', location: 'Cabinet 2',
    description: 'Supports 4K@60Hz output. Compatible with MacBook, Windows laptops, and tablets.', status: 'available' },
  { id: 'EQ-102', name: 'Digital Multimeter Fluke 117', category: 'Tools', lab: 'Electronics Lab', location: 'Shelf A',
    description: 'True-RMS digital multimeter for basic electrical measurements.', status: 'borrowed', availableFrom: '14:00 today' },
  { id: 'EQ-109', name: 'HDMI Cable 2 m', category: 'Cables', lab: 'Lab B-204', location: 'Drawer 1',
    description: 'High-speed HDMI cable, 2 m.', status: 'maintenance' },
  { id: 'EQ-111', name: 'Oscilloscope Probe Kit', category: 'Tools', lab: 'Electronics Lab', location: 'Shelf B',
    description: 'Probe set for bench oscilloscopes.', status: 'available' },
];

export const reservations: Reservation[] = [
  { id: 'r1', equipmentId: 'EQ-102', userId: 'u1', date: '2026-11-14', startHour: 13, endHour: 15, status: 'approved' },
  { id: 'r2', equipmentId: 'EQ-104', userId: 'u1', date: '2026-11-15', startHour: 11, endHour: 13, status: 'pending' },
];
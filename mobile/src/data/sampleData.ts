import { Equipment, Reservation, User } from '../types';
import { isoDate } from '../utils/format';

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
      { id: 'EQ-101', name: 'Arduino Uno R3 Board', category: 'Tools', lab: 'Electronics Lab', location: 'Shelf C',
    description: 'Microcontroller board for prototyping.', status: 'available' },
  { id: 'EQ-103', name: 'USB-C Charging Cable 1 m', category: 'Cables', lab: 'Lab B-204', location: 'Drawer 1',
    description: 'USB-C to USB-C charging cable.', status: 'available' },
  { id: 'EQ-105', name: 'DisplayPort to HDMI Adapter', category: 'Adapters', lab: 'Lab B-204', location: 'Cabinet 2',
    description: 'Active DisplayPort to HDMI adapter.', status: 'borrowed', availableFrom: '16:00 today' },
  { id: 'EQ-106', name: 'Soldering Station', category: 'Tools', lab: 'Electronics Lab', location: 'Bench 3',
    description: 'Temperature-controlled soldering station.', status: 'maintenance' },
  { id: 'EQ-107', name: 'Ethernet Cable 5 m', category: 'Cables', lab: 'Lab B-204', location: 'Drawer 2',
    description: 'Cat6 network cable.', status: 'available' },
  { id: 'EQ-108', name: 'USB-A to USB-C Adapter', category: 'Adapters', lab: 'Electronics Lab', location: 'Cabinet 1',
    description: 'Small USB-A to USB-C adapter.', status: 'available' },
  { id: 'EQ-110', name: 'Breadboard Kit', category: 'Tools', lab: 'Electronics Lab', location: 'Shelf B',
    description: 'Breadboard with jumper wires.', status: 'available' },
  { id: 'EQ-112', name: 'Laptop Charger 65W', category: 'Cables', lab: 'Lab B-204', location: 'Cabinet 3',
    description: 'Universal 65W laptop charger.', status: 'borrowed', availableFrom: 'tomorrow 09:00' },
];

export const reservations: Reservation[] = [
  { id: 'r1', equipmentId: 'EQ-102', userId: 'u1', date: isoDate(0), startHour: 13, endHour: 15, status: 'approved', handledBy: 'Staff01', handledAt: 'Today at 12:15' },
  { id: 'r2', equipmentId: 'EQ-104', userId: 'u1', date: isoDate(1), startHour: 11, endHour: 13, status: 'pending', requestedAgo: '5m ago' },
  { id: 'r3', equipmentId: 'EQ-104', userId: 'u2', date: isoDate(1), startHour: 12, endHour: 14, status: 'pending', requestedAgo: '12m ago' },
  { id: 'r4', equipmentId: 'EQ-111', userId: 'u2', date: isoDate(-1), startHour: 10, endHour: 12, status: 'rejected', note: 'Lab exam / class session', noteDetails: 'Reserved for CS102 lab exam until 17:00.', handledBy: 'Staff01', handledAt: 'Yesterday at 16:40' },
  { id: 'r5', equipmentId: 'EQ-104', userId: 'u2', date: isoDate(2), startHour: 9, endHour: 11, status: 'approved', handledBy: 'Staff01', handledAt: 'Yesterday at 10:05' },
];
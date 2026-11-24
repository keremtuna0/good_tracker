import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';
import type {
  Actor,
  BookingInput,
  Equipment,
  Reservation,
  Session,
  Store,
  Transition,
  User,
} from './model.ts';
import { booking, fail, overlaps, staff } from './rules.ts';

interface Account extends User {
  salt: string;
  passwordHash: string;
}
interface State {
  version: 1;
  accounts: Account[];
  equipment: Equipment[];
  reservations: Reservation[];
}

function initialState(): State {
  const accounts: Account[] = [
    {
      id: 'u1',
      name: 'User01',
      email: 'borrower@demo.test',
      role: 'borrower' as const,
    },
    {
      id: 'u2',
      name: 'User02',
      email: 'borrower2@demo.test',
      role: 'borrower' as const,
    },
    {
      id: 's1',
      name: 'Staff01',
      email: 'staff@demo.test',
      role: 'staff' as const,
    },
  ].map((user) => {
    const salt = randomBytes(16).toString('hex');
    return {
      ...user,
      salt,
      passwordHash: scryptSync('demo1234', salt, 32).toString('hex'),
    };
  });
  return {
    version: 1,
    accounts,
    reservations: [],
    equipment: [
      {
        id: 'EQ-104',
        name: 'USB-C to HDMI 4K Adapter',
        category: 'Adapters',
        lab: 'Lab B-204',
        location: 'Cabinet 2',
        description: '4K adapter for the shared laboratory.',
        status: 'available',
      },
      {
        id: 'EQ-102',
        name: 'Digital Multimeter',
        category: 'Tools',
        lab: 'Electronics Lab',
        location: 'Shelf A',
        description: 'Digital laboratory multimeter.',
        status: 'available',
      },
      {
        id: 'EQ-109',
        name: 'HDMI Cable 2 m',
        category: 'Cables',
        lab: 'Lab B-204',
        location: 'Drawer 1',
        description: 'Currently under maintenance.',
        status: 'maintenance',
      },
    ],
  };
}
function publicUser(account: Account): User {
  const { id, name, email, role } = account;
  return { id, name, email, role };
}

/** One API process only. Synchronous transactions commit through an atomic file rename. */
export class DemoStore implements Store {
  readonly mode = 'demo' as const;
  private state: State;
  private sessions = new Map<string, { userId: string; expires: number }>();
  private filename: string;
  private now: () => Date;
  private timezone: string;

  constructor(
    filename: string,
    now = () => new Date(),
    timezone = 'Europe/Istanbul'
  ) {
    this.filename = filename;
    this.now = now;
    this.timezone = timezone;
    this.state = existsSync(filename)
      ? JSON.parse(readFileSync(filename, 'utf8'))
      : initialState();
    if (this.state.version !== 1)
      throw new Error('Unsupported demo data version.');
    if (!existsSync(filename)) this.persist(this.state);
  }
  private persist(next: State) {
    mkdirSync(dirname(this.filename), { recursive: true });
    const temp = `${this.filename}.tmp`;
    writeFileSync(temp, JSON.stringify(next, null, 2), { mode: 0o600 });
    renameSync(temp, this.filename);
    this.state = next;
  }
  private commit<T>(fn: (next: State) => T): T {
    const next = structuredClone(this.state);
    const result = fn(next);
    this.persist(next);
    return structuredClone(result);
  }
  async signIn(email: string, password: string): Promise<Session> {
    const account = this.state.accounts.find(
      (u) => u.email === email.trim().toLowerCase()
    );
    // Hash on invalid accounts too, so the lookup does not shortcut password work.
    const hash = scryptSync(
      password,
      account?.salt ?? 'invalid-account-salt',
      32
    );
    if (
      !account ||
      !timingSafeEqual(hash, Buffer.from(account.passwordHash, 'hex'))
    )
      fail(401, 'INVALID_CREDENTIALS', 'Incorrect e-mail or password.');
    const accessToken = randomBytes(32).toString('hex');
    const expires = this.now().getTime() + 60 * 60 * 1000;
    for (const [token, value] of this.sessions)
      if (value.expires <= this.now().getTime()) this.sessions.delete(token);
    this.sessions.set(accessToken, { userId: account.id, expires });
    return {
      accessToken,
      expiresAt: new Date(expires).toISOString(),
      user: publicUser(account),
    };
  }
  async authenticate(token: string): Promise<Actor> {
    const session = this.sessions.get(token);
    if (!session || session.expires <= this.now().getTime()) {
      this.sessions.delete(token);
      fail(401, 'UNAUTHORIZED', 'Sign in again.');
    }
    const account = this.state.accounts.find((u) => u.id === session.userId)!;
    return { token, user: publicUser(account) };
  }
  async signOut(actor: Actor) {
    this.sessions.delete(actor.token);
  }
  async equipment(_actor: Actor) {
    return structuredClone(this.state.equipment);
  }
  async saveEquipment(actor: Actor, input: Equipment, create: boolean) {
    staff(actor.user);
    return this.commit((next) => {
      const index = next.equipment.findIndex((e) => e.id === input.id);
      if (create && index >= 0)
        fail(409, 'DUPLICATE', 'Equipment ID already exists.');
      if (!create && index < 0) fail(404, 'NOT_FOUND', 'Equipment not found.');
      if (create) next.equipment.push(input);
      else next.equipment[index] = input;
      return input;
    });
  }
  async reservations(actor: Actor) {
    return this.state.reservations
      .filter((r) => actor.user.role === 'staff' || r.userId === actor.user.id)
      .map((r) => {
        const borrower = this.state.accounts.find((u) => u.id === r.userId)!;
        return {
          ...structuredClone(r),
          ...(actor.user.role === 'staff'
            ? { borrowerName: borrower.name, borrowerEmail: borrower.email }
            : {}),
        };
      });
  }
  async availability(_actor: Actor) {
    return this.state.reservations
      .filter((r) => r.status === 'approved')
      .map((r) => {
        const { id, equipmentId, date, startHour, endHour } = r;
        return { id, equipmentId, date, startHour, endHour };
      });
  }
  async reserve(actor: Actor, input: BookingInput) {
    if (actor.user.role !== 'borrower')
      fail(403, 'FORBIDDEN', 'Use a borrower account to request equipment.');
    booking(input, this.now(), this.timezone);
    return this.commit((next) => {
      const item = next.equipment.find((e) => e.id === input.equipmentId);
      if (!item) fail(404, 'NOT_FOUND', 'Equipment not found.');
      if (item.status === 'maintenance')
        fail(409, 'MAINTENANCE', 'Equipment is under maintenance.');
      if (
        next.reservations.some(
          (r) => r.status === 'approved' && overlaps(r, input)
        )
      )
        fail(409, 'SLOT_CONFLICT', 'An approved booking occupies this slot.');
      if (
        next.reservations.some(
          (r) =>
            r.userId === actor.user.id &&
            r.status === 'pending' &&
            overlaps(r, input)
        )
      )
        fail(
          409,
          'DUPLICATE_REQUEST',
          'You already requested an overlapping slot.'
        );
      const result: Reservation = {
        ...input,
        id: randomUUID(),
        userId: actor.user.id,
        status: 'pending',
        createdAt: this.now().toISOString(),
      };
      next.reservations.push(result);
      return result;
    });
  }
  async transition(
    actor: Actor,
    id: string,
    action: Transition,
    note: string,
    details: string
  ) {
    return this.commit((next) => {
      const r = next.reservations.find((r) => r.id === id);
      if (!r) fail(404, 'NOT_FOUND', 'Reservation not found.');
      if (action === 'cancel') {
        if (actor.user.id !== r.userId)
          fail(403, 'FORBIDDEN', 'Only the owner can cancel this reservation.');
        if (!['pending', 'approved'].includes(r.status))
          fail(409, 'INVALID_STATE', 'Reservation is no longer cancellable.');
        booking(r, this.now(), this.timezone);
        r.status = 'cancelled';
      } else {
        staff(actor.user);
        if (r.status !== 'pending')
          fail(409, 'INVALID_STATE', 'Only pending requests can be handled.');
        if (action === 'approve') {
          booking(r, this.now(), this.timezone);
          if (
            next.equipment.find((e) => e.id === r.equipmentId)?.status ===
            'maintenance'
          )
            fail(409, 'MAINTENANCE', 'Equipment is under maintenance.');
          if (
            next.reservations.some(
              (other) =>
                other.id !== r.id &&
                other.status === 'approved' &&
                overlaps(other, r)
            )
          )
            fail(
              409,
              'SLOT_CONFLICT',
              'An approved booking occupies this slot.'
            );
          r.status = 'approved';
          for (const other of next.reservations) {
            if (
              other.id !== r.id &&
              other.status === 'pending' &&
              overlaps(other, r)
            ) {
              Object.assign(other, {
                status: 'rejected',
                note: 'Slot given to another request',
                handledBy: actor.user.name,
                handledAt: this.now().toISOString(),
              });
            }
          }
        } else {
          r.status = 'rejected';
          r.note = note;
          r.noteDetails = details;
        }
        r.handledBy = actor.user.name;
        r.handledAt = this.now().toISOString();
      }
      return r;
    });
  }
}

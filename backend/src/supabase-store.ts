import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Actor,
  BookingInput,
  BusySlot,
  Equipment,
  Reservation,
  Session,
  Store,
  Transition,
} from './model.ts';
import { ApiError, fail } from './rules.ts';

function check(error: { message: string; code?: string } | null) {
  if (!error) return;
  const match = error.message.match(/^GT:(\w+):(.+)$/s);
  if (match) {
    const status: Record<string, number> = {
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      VALIDATION: 400,
      PAST_SLOT: 400,
    };
    throw new ApiError(status[match[1]] ?? 409, match[1], match[2]);
  }
  if (error.code === '23P01')
    fail(409, 'SLOT_CONFLICT', 'An approved booking occupies this slot.');
  if (error.code === '23505')
    fail(409, 'DUPLICATE', 'This record already exists.');
  if (error.code === '42501') fail(403, 'FORBIDDEN', 'Permission denied.');
  if (['23514', '22P02', '22007', '22008'].includes(error.code ?? ''))
    fail(400, 'VALIDATION', 'Invalid data.');
  // Do not expose database details or keys to callers.
  console.error('Supabase operation failed:', error.code ?? 'transport');
  fail(
    503,
    'DATABASE_UNAVAILABLE',
    'Database request failed. Check server configuration.'
  );
}

export class SupabaseStore implements Store {
  readonly mode = 'supabase' as const;
  private url: string;
  private key: string;
  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }
  private client(token?: string): SupabaseClient {
    return createClient(this.url, this.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      ...(token
        ? { global: { headers: { Authorization: `Bearer ${token}` } } }
        : {}),
    });
  }
  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await this.client().auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session)
      fail(401, 'INVALID_CREDENTIALS', 'Incorrect e-mail or password.');
    const { user } = await this.authenticate(data.session.access_token);
    return {
      accessToken: data.session.access_token,
      expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
      user,
    };
  }
  async authenticate(token: string): Promise<Actor> {
    const client = this.client(token);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) fail(401, 'UNAUTHORIZED', 'Sign in again.');
    const profile = await client
      .from('profiles')
      .select('id,name,email,role')
      .eq('id', data.user.id)
      .single();
    check(profile.error);
    if (!profile.data || !['borrower', 'staff'].includes(profile.data.role))
      fail(403, 'PROFILE_MISSING', 'An application profile is required.');
    return { token, user: profile.data };
  }
  async signOut(actor: Actor) {
    const response = await fetch(`${this.url}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: { apikey: this.key, Authorization: `Bearer ${actor.token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok && response.status !== 401)
      fail(503, 'AUTH_UNAVAILABLE', 'Unable to close session.');
    // Supabase access JWTs remain valid until expiry; mobile discards its token immediately.
  }
  async equipment(actor: Actor): Promise<Equipment[]> {
    const result = await this.client(actor.token)
      .from('equipment')
      .select('*')
      .order('id');
    check(result.error);
    return result.data ?? [];
  }
  async saveEquipment(
    actor: Actor,
    input: Equipment,
    create: boolean
  ): Promise<Equipment> {
    const result = await this.client(actor.token).rpc('gt_save_equipment', {
      p_item: input,
      p_create: create,
    });
    check(result.error);
    return result.data;
  }
  async reservations(actor: Actor): Promise<Reservation[]> {
    const client = this.client(actor.token);
    const result = await client
      .from('reservations')
      .select('*')
      .order('createdAt', { ascending: false });
    check(result.error);
    const rows = result.data ?? [];
    if (actor.user.role !== 'staff' || !rows.length) return rows;
    const ids = [...new Set(rows.map((r) => r.userId as string))];
    const profiles = await client
      .from('profiles')
      .select('id,name,email')
      .in('id', ids);
    check(profiles.error);
    return rows.map((r) => {
      const borrower = profiles.data?.find((p) => p.id === r.userId);
      return {
        ...r,
        borrowerName: borrower?.name,
        borrowerEmail: borrower?.email,
      };
    });
  }
  async availability(actor: Actor): Promise<BusySlot[]> {
    const result = await this.client(actor.token).rpc('gt_busy_slots');
    check(result.error);
    return result.data ?? [];
  }
  async reserve(actor: Actor, input: BookingInput): Promise<Reservation> {
    const result = await this.client(actor.token).rpc('gt_create_reservation', {
      p_input: input,
    });
    check(result.error);
    return result.data;
  }
  async transition(
    actor: Actor,
    id: string,
    action: Transition,
    note: string,
    details: string
  ): Promise<Reservation> {
    const result = await this.client(actor.token).rpc(
      'gt_transition_reservation',
      {
        p_id: id,
        p_action: action,
        p_note: note,
        p_details: details,
      }
    );
    check(result.error);
    return result.data;
  }
}

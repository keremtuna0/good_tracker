import { createClient } from '@supabase/supabase-js';

// Explicit setup utility; never imported by the API or the mobile client.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SEED_PASSWORD;
if (!url || !key || !password || password.length < 12)
  throw new Error(
    'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and a SEED_PASSWORD of 12+ characters.'
  );
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
for (const [email, name, role] of [
  ['borrower@demo.test', 'User01', 'borrower'],
  ['borrower2@demo.test', 'User02', 'borrower'],
  ['staff@demo.test', 'Staff01', 'staff'],
]) {
  const result = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (result.error)
    throw new Error(
      `Could not create ${email}: ${result.error.message}. This setup script is intended for a new demo project.`
    );
  const profile = await client
    .from('profiles')
    .update({ role })
    .eq('id', result.data.user.id);
  if (profile.error) throw profile.error;
  console.log(`Created ${role} profile: ${email}`);
}
const equipment = await client.from('equipment').insert([
  {
    id: 'EQ-104',
    name: 'USB-C to HDMI Adapter',
    category: 'Adapters',
    lab: 'Lab B-204',
    location: 'Cabinet 2',
    description: 'Sample shared adapter',
    status: 'available',
  },
  {
    id: 'EQ-102',
    name: 'Digital Multimeter',
    category: 'Tools',
    lab: 'Electronics Lab',
    location: 'Shelf A',
    description: 'Sample multimeter',
    status: 'available',
  },
  {
    id: 'EQ-109',
    name: 'HDMI Cable 2 m',
    category: 'Cables',
    lab: 'Lab B-204',
    location: 'Drawer 1',
    description: 'Under maintenance',
    status: 'maintenance',
  },
]);
if (equipment.error) throw equipment.error;
console.log('Demo equipment inserted. No reservations created.');

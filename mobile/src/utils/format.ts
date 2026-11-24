const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
export const formatRange = (s: number, e: number) => `${hh(s)} – ${hh(e)}`;
export const duration = (s: number, e: number) => `${e - s} h`;

const parse = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function formatDate(date: string) {
  const dt = parse(date);
  return `${DAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
}

export const shortDay = (date: string) => DAYS[parse(date).getDay()];
export const dayNumber = (date: string) => parse(date).getDate();
export const monthYear = (date: string) => {
  const dt = parse(date);
  return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

export function isoDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (key: string) => parts.find(p => p.type === key)!.value;
  const d = new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const bookingHour = () => Number(new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Istanbul', hour: '2-digit', hourCycle: 'h23',
}).format(new Date()));

export const initials = (name: string) =>
  name.charAt(0).toUpperCase() + (name.match(/(\d)$/)?.[1] ?? '');

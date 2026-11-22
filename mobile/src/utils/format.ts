const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const hh = (h: number) => ${String(h).padStart(2, '0')}:00;
export const formatRange = (s: number, e: number) => ${hh(s)} – ${hh(e)};
export const duration = (s: number, e: number) => ${e - s} h;

export function formatDate(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return ${DAYS[dt.getDay()]}, ${d} ${MONTHS[m - 1]};
}

export const initials = (name: string) =>
  name.charAt(0).toUpperCase() + (name.match(/(\d)$/)?.[1] ?? '');
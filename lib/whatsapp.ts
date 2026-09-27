/**
 * Build a WhatsApp click-to-chat link.
 * Handles Kenyan numbers: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  let normalized = digits;

  if (normalized.startsWith('0')) {
    normalized = '254' + normalized.slice(1);
  } else if (normalized.startsWith('7') && normalized.length === 9) {
    normalized = '254' + normalized;
  } else if (normalized.startsWith('254')) {
    // already good
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Convert '2026-09' → 'September 2026'
 */
function prettyMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleString('en-KE', { month: 'long', year: 'numeric' });
}

export function rentReminderMessage(opts: {
  tenantName: string;
  amount: number;
  month: string;
  landlordName: string;
  dueDay?: number;
  payTo?: string;
}): string {
  const { tenantName, amount, month, landlordName, dueDay, payTo } = opts;

  const pretty = prettyMonth(month);
  const duePhrase = dueDay ? ` on the ${ordinal(dueDay)}` : '';
  const payPhrase = payTo ? ` Kindly pay via ${payTo}.` : '';

  return (
    `Hi ${tenantName}, a friendly reminder from ${landlordName}. ` +
    `Your rent of KES ${amount.toLocaleString()} for ${pretty} is due${duePhrase}.` +
    payPhrase +
    ` Thank you.`
  );
}
/** Shared formatting utilities for Accora. */

export function fmtCurrency(n: number, _currency?: string | number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function fmtNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function fmtPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

export function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function periodLabel(period: string): string {
  // "2026-01" -> "Jan"
  const [, m] = period.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(m, 10) - 1] ?? period;
}

/**
 * Sanitizes a string or value for CSV export to prevent spreadsheet formula injection (CWE-1236).
 * Prepends a single quote if the field begins with =, +, -, @, tab, or carriage return.
 */
export function sanitizeCsvField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  const trimmed = str.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

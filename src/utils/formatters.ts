// Currency & Date Formatting Utilities for Nigerian SaaS

export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₦0';
  }
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/**
 * Formats a raw number or numeric string with commas as thousands separators dynamically.
 * e.g. "1234567" -> "1,234,567"
 * Preserves decimal points: "1234." -> "1,234." and "1234.50" -> "1,234.50"
 */
export function formatNumberWithCommas(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (!str.trim()) return '';

  // Remove existing commas
  const raw = str.replace(/,/g, '');

  // Separate integer and decimal components
  const parts = raw.split('.');
  const integerPart = parts[0].replace(/\D/g, '');
  const hasDecimal = parts.length > 1;
  const decimalPart = hasDecimal ? parts.slice(1).join('').replace(/\D/g, '') : '';

  if (!integerPart && !hasDecimal) return '';

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (hasDecimal) {
    return (formattedInteger || '0') + '.' + decimalPart;
  }

  return formattedInteger;
}

/**
 * Strips commas and converts to a clean numeric float.
 */
export function parseRawPrice(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const clean = String(value).replace(/,/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Strips commas from a formatted string, returning pure digits and dot.
 */
export function cleanPriceString(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value).replace(/,/g, '').trim();
}


export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

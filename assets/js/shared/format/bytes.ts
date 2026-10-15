import { $locale } from '../i18n';

// ? SI units, not powers of two: XP reports application sizes the same way the market does.
const UNITS = ['B', 'kB', 'MB', 'GB', 'TB'] as const;
const STEP = 1000;

export function formatBytes(bytes: number, locale: string = $locale.get()): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '';
  }

  let value = bytes;
  let unit = 0;
  while (value >= STEP && unit < UNITS.length - 1) {
    value /= STEP;
    unit++;
  }

  const fractionDigits = unit === 0 || value >= 10 ? 0 : 1;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  return `${formatted} ${UNITS[unit]}`;
}

import moment from 'moment';

export type ExpiryStatus = 'expired' | 'near' | 'fresh';

/**
 * Single source of truth for calculating grocery expiry status across all screens.
 * - Expired: Expiry date is before today
 * - Near Expiry: Expiry date is within 3 days (0 to 3 days remaining)
 * - Fresh: Expiry date is more than 3 days away
 */
export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  if (!expiryDate) return 'fresh';
  const today = moment().startOf('day');
  const expiry = moment(expiryDate).startOf('day');
  if (expiry.isBefore(today)) return 'expired';
  const daysRemaining = expiry.diff(today, 'days');
  if (daysRemaining <= 3) return 'near';
  return 'fresh';
};

/**
 * Calculates human-readable days remaining string or relative time.
 */
export const getDaysRemaining = (expiryDate: string): number => {
  if (!expiryDate) return 0;
  const today = moment().startOf('day');
  const expiry = moment(expiryDate).startOf('day');
  return expiry.diff(today, 'days');
};

/**
 * Valid booking lifecycle states and permitted state transitions.
 * 
 * Permitted transitions:
 * RESERVED   -> CONFIRMED, CANCELLED
 * CONFIRMED  -> CHECKED_IN, CANCELLED
 * CHECKED_IN -> CHECKED_OUT
 * CHECKED_OUT -> (terminal state)
 * CANCELLED  -> (terminal state)
 */

const BOOKING_STATUSES = {
  RESERVED: 'RESERVED',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
};

const ALLOWED_TRANSITIONS = {
  [BOOKING_STATUSES.RESERVED]: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.CANCELLED],
  [BOOKING_STATUSES.CONFIRMED]: [BOOKING_STATUSES.CHECKED_IN, BOOKING_STATUSES.CANCELLED],
  [BOOKING_STATUSES.CHECKED_IN]: [BOOKING_STATUSES.CHECKED_OUT],
  [BOOKING_STATUSES.CHECKED_OUT]: [],
  [BOOKING_STATUSES.CANCELLED]: [],
};

/**
 * Check if transitioning from currentStatus to targetStatus is valid.
 * 
 * @param {string} currentStatus 
 * @param {string} targetStatus 
 * @returns {boolean}
 */
const isValidStatusTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
};

module.exports = {
  BOOKING_STATUSES,
  ALLOWED_TRANSITIONS,
  isValidStatusTransition,
};

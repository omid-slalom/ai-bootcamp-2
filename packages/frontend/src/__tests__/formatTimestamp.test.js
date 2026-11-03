import { formatTimestamp } from '../utils/formatTimestamp';

describe('formatTimestamp', () => {
  test('formats an ISO string as a readable date and time', () => {
    expect(formatTimestamp('2023-01-01T12:00:00.000Z')).toMatch(/^Jan 1, 2023, \d{1,2}:\d{2}\s?[AP]M$/);
  });

  test('returns an empty string for missing values', () => {
    expect(formatTimestamp(undefined)).toBe('');
    expect(formatTimestamp('')).toBe('');
  });
});

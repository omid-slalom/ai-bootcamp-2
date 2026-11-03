const { parseName, parseId } = require('../src/validation');

describe('parseName', () => {
  it('returns the trimmed name', () => {
    expect(parseName('  Buy milk  ')).toBe('Buy milk');
  });

  it.each([undefined, null, '', '   ', 42, {}])('returns null for %p', (value) => {
    expect(parseName(value)).toBeNull();
  });
});

describe('parseId', () => {
  it('returns an integer for numeric strings', () => {
    expect(parseId('12')).toBe(12);
  });

  it.each(['abc', '12abc', '', '-1', '1.5', undefined])('returns null for %p', (value) => {
    expect(parseId(value)).toBeNull();
  });
});

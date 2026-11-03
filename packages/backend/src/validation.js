const parseName = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const parseId = (value) => (/^\d+$/.test(value ?? '') ? parseInt(value, 10) : null);

module.exports = { parseName, parseId };

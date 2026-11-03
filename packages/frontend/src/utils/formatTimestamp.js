const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export const formatTimestamp = (iso) => (iso ? formatter.format(new Date(iso)) : '');

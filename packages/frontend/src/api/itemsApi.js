const BASE_URL = '/api/items';

const request = async (path, options, failureMessage) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || failureMessage);
  }
  return response.json();
};

const jsonOptions = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const getItems = () => request('', undefined, 'Network response was not ok');

export const createItem = (name) => request('', jsonOptions('POST', { name }), 'Failed to add item');

export const updateItem = (id, name) =>
  request(`/${id}`, jsonOptions('PUT', { name }), 'Failed to update item');

export const deleteItem = (id) => request(`/${id}`, { method: 'DELETE' }, 'Failed to delete item');

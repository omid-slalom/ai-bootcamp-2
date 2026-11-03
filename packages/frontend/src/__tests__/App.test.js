import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import toast from 'react-hot-toast';
import App from '../App';

let items;
let nextId;

const seedItems = () => [
  { id: 1, name: 'Test Item 1', created_at: '2023-01-01T12:00:00.000Z', updated_at: '2023-01-01T12:00:00.000Z' },
  { id: 2, name: 'Test Item 2', created_at: '2023-01-02T12:00:00.000Z', updated_at: '2023-01-02T12:00:00.000Z' },
];

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => res(ctx.status(200), ctx.json(items))),

  rest.post('/api/items', (req, res, ctx) => {
    const now = new Date().toISOString();
    const item = { id: nextId++, name: req.body.name, created_at: now, updated_at: now };
    items.push(item);
    return res(ctx.status(201), ctx.json(item));
  }),

  rest.put('/api/items/:id', (req, res, ctx) => {
    const item = items.find((i) => i.id === Number(req.params.id));
    if (!item) return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    item.name = req.body.name;
    item.updated_at = new Date().toISOString();
    return res(ctx.status(200), ctx.json(item));
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    items = items.filter((i) => i.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully', id }));
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  items = seedItems();
  nextId = 3;
});
afterEach(() => {
  server.resetHandlers();
  toast.remove();
});
afterAll(() => server.close());

const renderLoaded = async () => {
  render(<App />);
  await screen.findByText('Test Item 1');
};

describe('App', () => {
  test('renders the header', async () => {
    await renderLoaded();

    expect(screen.getByRole('heading', { name: 'To Do App' })).toBeInTheDocument();
  });

  test('shows a loading state, then the items in the order they were added', async () => {
    render(<App />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    await screen.findByText('Test Item 1');

    const names = screen.getAllByRole('listitem').map((li) => within(li).getByTestId('item-name').textContent);
    expect(names).toEqual(['Test Item 1', 'Test Item 2']);
  });

  test('shows an error when items cannot be loaded', async () => {
    server.use(rest.get('/api/items', (req, res, ctx) => res(ctx.status(500))));

    render(<App />);

    expect(await screen.findByText(/Failed to fetch data/)).toBeInTheDocument();
  });

  test('shows the empty state when there are no items', async () => {
    items = [];

    render(<App />);

    expect(await screen.findByText('No items found. Add some!')).toBeInTheDocument();
  });

  test('adds an item at the end of the list and shows a toast', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.type(screen.getByPlaceholderText('Enter item name'), 'New Test Item');
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(await screen.findByText('New Test Item')).toBeInTheDocument();
    expect(await screen.findByText('Item added')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByPlaceholderText('Enter item name')).toHaveValue('');
  });

  test('rejects an empty item with an error toast', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(await screen.findByText('Item name is required')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  test('edits an item, shows an edited timestamp and a toast', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    expect(screen.queryByText(/Edited/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Test Item 1' }));
    const input = screen.getByLabelText('Edit item name');
    await user.clear(input);
    await user.type(input, 'Renamed Item');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Renamed Item')).toBeInTheDocument();
    expect(await screen.findByText('Item updated')).toBeInTheDocument();
    expect(screen.getByText(/Edited/)).toBeInTheDocument();
    const names = screen.getAllByTestId('item-name').map((el) => el.textContent);
    expect(names).toEqual(['Renamed Item', 'Test Item 2']);
  });

  test('cancelling an edit keeps the original name', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Test Item 1' }));
    await user.type(screen.getByLabelText('Edit item name'), ' changed');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.queryByLabelText('Edit item name')).not.toBeInTheDocument();
  });

  test('rejects an empty edit and stays in edit mode', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Test Item 1' }));
    await user.clear(screen.getByLabelText('Edit item name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Item name is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit item name')).toBeInTheDocument();
  });

  test('deletes an item, keeps the order of the rest and shows a toast', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Delete Test Item 1' }));

    await waitFor(() => expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument());
    expect(await screen.findByText('Item deleted')).toBeInTheDocument();
    expect(screen.getAllByTestId('item-name').map((el) => el.textContent)).toEqual(['Test Item 2']);
  });

  test('shows an error toast when delete fails', async () => {
    const user = userEvent.setup();
    await renderLoaded();
    server.use(rest.delete('/api/items/:id', (req, res, ctx) => res(ctx.status(500), ctx.json({ error: 'boom' }))));

    await user.click(screen.getByRole('button', { name: 'Delete Test Item 1' }));

    expect(await screen.findByText(/Failed to delete item: boom/)).toBeInTheDocument();
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemRow from '../components/ItemRow';

const item = {
  id: 1,
  name: 'Buy milk',
  created_at: '2023-01-01T12:00:00.000Z',
  updated_at: '2023-01-01T12:00:00.000Z',
};

const setup = (overrides = {}, handlers = {}) => {
  const props = {
    item: { ...item, ...overrides },
    onUpdate: jest.fn().mockResolvedValue(true),
    onDelete: jest.fn(),
    ...handlers,
  };
  render(<ul><ItemRow {...props} /></ul>);
  return props;
};

describe('ItemRow', () => {
  test('shows the added timestamp but no edited timestamp for an unedited item', () => {
    setup();

    expect(screen.getByText(/Added/)).toHaveTextContent('Jan 1, 2023');
    expect(screen.queryByText(/Edited/)).not.toBeInTheDocument();
  });

  test('shows the edited timestamp when updated_at differs from created_at', () => {
    setup({ updated_at: '2023-02-03T12:00:00.000Z' });

    expect(screen.getByText(/Edited/)).toHaveTextContent('Feb 3, 2023');
  });

  test('calls onDelete with the item id', async () => {
    const { onDelete } = setup();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete Buy milk' }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test('saves with the new name and leaves edit mode on success', async () => {
    const user = userEvent.setup();
    const { onUpdate } = setup();

    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }));
    const input = screen.getByLabelText('Edit item name');
    expect(input).toHaveValue('Buy milk');
    await user.clear(input);
    await user.type(input, 'Buy oat milk{Enter}');

    expect(onUpdate).toHaveBeenCalledWith(1, 'Buy oat milk');
    expect(await screen.findByRole('button', { name: 'Edit Buy milk' })).toBeInTheDocument();
  });

  test('stays in edit mode when the update fails', async () => {
    const user = userEvent.setup();
    setup({}, { onUpdate: jest.fn().mockResolvedValue(false) });

    await user.click(screen.getByRole('button', { name: 'Edit Buy milk' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByLabelText('Edit item name')).toBeInTheDocument();
  });
});

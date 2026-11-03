const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

const BACKEND_URL = `http://localhost:${process.env.BACKEND_PORT || 3030}`;
const PREFIX = 'E2E';

const uniqueName = (label) => `${PREFIX} ${label} ${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

// The backend keeps data in memory, so remove everything this suite created.
const removeE2eItems = async (request) => {
  const items = await (await request.get(`${BACKEND_URL}/api/items`)).json();
  await Promise.all(
    items
      .filter((item) => item.name.startsWith(PREFIX))
      .map((item) => request.delete(`${BACKEND_URL}/api/items/${item.id}`))
  );
};

test.describe('Todo workflow', () => {
  let todo;

  test.beforeEach(async ({ page, request }) => {
    await removeE2eItems(request);
    todo = new TodoPage(page);
    await todo.goto();
  });

  test.afterEach(async ({ request }) => {
    await removeE2eItems(request);
  });

  test('adds an item and shows a toast', async () => {
    const name = uniqueName('add');

    await todo.addItem(name);

    await expect(todo.row(name)).toBeVisible();
    await expect(todo.row(name)).toContainText('Added');
    await expect(todo.toast('Item added')).toBeVisible();
    await expect(todo.nameInput).toHaveValue('');
  });

  test('edits an item, timestamps the edit and shows a toast', async () => {
    const name = uniqueName('edit');
    const newName = uniqueName('renamed');
    await todo.addItem(name);
    await expect(todo.row(name)).toBeVisible();
    await expect(todo.row(name)).not.toContainText('Edited');

    await todo.editItem(name, newName);

    await expect(todo.row(newName)).toBeVisible();
    await expect(todo.row(newName)).toContainText('Edited');
    await expect(todo.row(name)).toHaveCount(0);
    await expect(todo.toast('Item updated')).toBeVisible();
  });

  test('cancelling an edit keeps the original item', async () => {
    const name = uniqueName('cancel');
    await todo.addItem(name);
    await expect(todo.row(name)).toBeVisible();

    await todo.startEditing(name);
    await todo.page.getByLabel('Edit item name').fill(uniqueName('discarded'));
    await todo.cancelEdit();

    await expect(todo.row(name)).toBeVisible();
    await expect(todo.row(name)).not.toContainText('Edited');
  });

  test('deletes an item without changing the order of the others', async () => {
    const [first, second, third] = [uniqueName('a'), uniqueName('b'), uniqueName('c')];
    for (const name of [first, second, third]) {
      await todo.addItem(name);
      await expect(todo.row(name)).toBeVisible();
    }

    await todo.deleteItem(second);

    await expect(todo.row(second)).toHaveCount(0);
    await expect(todo.toast('Item deleted')).toBeVisible();
    const names = (await todo.allItemNames()).filter((n) => n.startsWith(PREFIX));
    expect(names).toEqual([first, third]);
  });

  test('lists items in the order they were added', async () => {
    const names = [uniqueName('one'), uniqueName('two'), uniqueName('three')];
    for (const name of names) {
      await todo.addItem(name);
      await expect(todo.row(name)).toBeVisible();
    }

    await todo.page.reload();
    await expect(todo.row(names[0])).toBeVisible();

    const listed = (await todo.allItemNames()).filter((n) => n.startsWith(PREFIX));
    expect(listed).toEqual(names);
  });

  test('rejects an empty item with an error toast', async () => {
    const before = await todo.itemNames.count();

    await todo.addItem('   ');

    await expect(todo.toast('Item name is required')).toBeVisible();
    await expect(todo.itemNames).toHaveCount(before);
  });
});

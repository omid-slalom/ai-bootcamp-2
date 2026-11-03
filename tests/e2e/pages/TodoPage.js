const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder('Enter item name');
    this.addButton = page.getByRole('button', { name: 'Add Item' });
    this.itemNames = page.getByTestId('item-name');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'To Do App' })).toBeVisible();
    await expect(this.addButton).toBeVisible();
    await expect(this.page.getByText('Loading data...')).toBeHidden();
  }

  row(name) {
    return this.page.getByRole('listitem').filter({ has: this.page.getByText(name, { exact: true }) });
  }

  toast(message) {
    return this.page.getByRole('status').filter({ hasText: message });
  }

  async addItem(name) {
    await this.nameInput.fill(name);
    await this.addButton.click();
  }

  async startEditing(name) {
    await this.page.getByRole('button', { name: `Edit ${name}` }).click();
  }

  async editItem(name, newName) {
    await this.startEditing(name);
    await this.page.getByLabel('Edit item name').fill(newName);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async cancelEdit() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async deleteItem(name) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async allItemNames() {
    return this.itemNames.allTextContents();
  }
}

module.exports = { TodoPage };

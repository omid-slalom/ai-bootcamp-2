const { createApp } = require('./app');
const { createDb } = require('./db');
const { createItemsRepository } = require('./repositories/itemsRepository');

const PORT = process.env.PORT || 3030;
const SEED_ITEMS = ['Item 1', 'Item 2', 'Item 3'];

const itemsRepository = createItemsRepository(createDb());
SEED_ITEMS.forEach((name) => itemsRepository.create(name));
console.log('In-memory database initialized with sample data');

const app = createApp({ itemsRepository });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/items`);
});
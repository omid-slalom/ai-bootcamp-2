const express = require('express');
const { parseName, parseId } = require('../validation');

const NAME_REQUIRED = { error: 'Item name is required' };
const ID_REQUIRED = { error: 'Valid item ID is required' };
const NOT_FOUND = { error: 'Item not found' };

const handle = (action, failureMessage) => (req, res) => {
  try {
    action(req, res);
  } catch (error) {
    console.error(`${failureMessage}:`, error);
    res.status(500).json({ error: failureMessage });
  }
};

const createItemsRouter = (repo) => {
  const router = express.Router();

  router.get('/', handle((req, res) => {
    res.json(repo.findAll());
  }, 'Failed to fetch items'));

  router.post('/', handle((req, res) => {
    const name = parseName(req.body?.name);
    if (!name) return res.status(400).json(NAME_REQUIRED);

    res.status(201).json(repo.create(name));
  }, 'Failed to create item'));

  router.put('/:id', handle((req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(ID_REQUIRED);

    const name = parseName(req.body?.name);
    if (!name) return res.status(400).json(NAME_REQUIRED);

    const updated = repo.update(id, name);
    if (!updated) return res.status(404).json(NOT_FOUND);

    res.json(updated);
  }, 'Failed to update item'));

  router.delete('/:id', handle((req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(ID_REQUIRED);

    if (!repo.remove(id)) return res.status(404).json(NOT_FOUND);

    res.json({ message: 'Item deleted successfully', id });
  }, 'Failed to delete item'));

  return router;
};

module.exports = { createItemsRouter };

const createItemsRepository = (db) => {
  const selectAll = db.prepare('SELECT * FROM items ORDER BY id ASC');
  const selectById = db.prepare('SELECT * FROM items WHERE id = ?');
  const insert = db.prepare('INSERT INTO items (name) VALUES (?)');
  const updateName = db.prepare(
    "UPDATE items SET name = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  );
  const deleteById = db.prepare('DELETE FROM items WHERE id = ?');

  const findById = (id) => selectById.get(id);

  return {
    findAll: () => selectAll.all(),
    findById,
    create: (name) => findById(Number(insert.run(name).lastInsertRowid)),
    update: (id, name) => (updateName.run(name, id).changes > 0 ? findById(id) : null),
    remove: (id) => deleteById.run(id).changes > 0,
  };
};

module.exports = { createItemsRepository };

import React from 'react';
import ItemRow from './ItemRow';

function ItemList({ items, onUpdate, onDelete }) {
  if (items.length === 0) return <p>No items found. Add some!</p>;

  return (
    <ul>
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default ItemList;

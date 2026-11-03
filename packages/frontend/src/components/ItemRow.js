import React, { useState } from 'react';
import { formatTimestamp } from '../utils/formatTimestamp';

function ItemRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);

  const startEditing = () => {
    setDraft(item.name);
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (await onUpdate(item.id, draft)) setEditing(false);
  };

  if (editing) {
    return (
      <li className="item-row">
        <form className="edit-form" onSubmit={handleSave}>
          <input
            type="text"
            aria-label="Edit item name"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <button type="submit">Save</button>
          <button type="button" className="secondary-btn" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  const edited = item.updated_at && item.updated_at !== item.created_at;

  return (
    <li className="item-row">
      <div className="item-details">
        <span className="item-name" data-testid="item-name">{item.name}</span>
        <small className="item-meta">
          <span>Added {formatTimestamp(item.created_at)}</span>
          {edited && <span>Edited {formatTimestamp(item.updated_at)}</span>}
        </small>
      </div>
      <div className="item-actions">
        <button type="button" className="secondary-btn" aria-label={`Edit ${item.name}`} onClick={startEditing}>
          Edit
        </button>
        <button type="button" className="delete-btn" aria-label={`Delete ${item.name}`} onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default ItemRow;

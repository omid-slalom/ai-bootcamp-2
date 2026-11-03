import { useCallback, useEffect, useState } from 'react';
import * as itemsApi from '../api/itemsApi';
import { notifyError, notifySuccess } from '../utils/notify';

const NAME_REQUIRED = 'Item name is required';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    itemsApi
      .getItems()
      .then((result) => !cancelled && setItems(result))
      .catch((err) => !cancelled && setLoadError(`Failed to fetch data: ${err.message}`))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = useCallback(async (action, { success, failure }) => {
    try {
      await action();
      notifySuccess(success);
      return true;
    } catch (err) {
      notifyError(`${failure}: ${err.message}`);
      return false;
    }
  }, []);

  const addItem = useCallback(
    async (name) => {
      const trimmed = name.trim();
      if (!trimmed) {
        notifyError(NAME_REQUIRED);
        return false;
      }
      return mutate(
        async () => {
          const created = await itemsApi.createItem(trimmed);
          setItems((prev) => [...prev, created]);
        },
        { success: 'Item added', failure: 'Failed to add item' }
      );
    },
    [mutate]
  );

  const updateItem = useCallback(
    async (id, name) => {
      const trimmed = name.trim();
      if (!trimmed) {
        notifyError(NAME_REQUIRED);
        return false;
      }
      return mutate(
        async () => {
          const updated = await itemsApi.updateItem(id, trimmed);
          setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
        },
        { success: 'Item updated', failure: 'Failed to update item' }
      );
    },
    [mutate]
  );

  const deleteItem = useCallback(
    (id) =>
      mutate(
        async () => {
          await itemsApi.deleteItem(id);
          setItems((prev) => prev.filter((item) => item.id !== id));
        },
        { success: 'Item deleted', failure: 'Failed to delete item' }
      ),
    [mutate]
  );

  return { items, loading, loadError, addItem, updateItem, deleteItem };
};

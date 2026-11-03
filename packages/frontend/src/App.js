import React from 'react';
import './App.css';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import ToastHost from './components/ToastHost';
import { useItems } from './hooks/useItems';

function App() {
  const { items, loading, loadError, addItem, updateItem, deleteItem } = useItems();

  return (
    <div className="App">
      <ToastHost />
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Item</h2>
          <ItemForm onAdd={addItem} />
        </section>

        <section className="items-section">
          <h2>Items</h2>
          {loading && <p>Loading data...</p>}
          {loadError && <p className="error">{loadError}</p>}
          {!loading && !loadError && (
            <ItemList items={items} onUpdate={updateItem} onDelete={deleteItem} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

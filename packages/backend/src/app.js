const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createItemsRouter } = require('./routes/items');

const createApp = ({ itemsRepository }) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });

  app.use('/api/items', createItemsRouter(itemsRepository));

  return app;
};

module.exports = { createApp };

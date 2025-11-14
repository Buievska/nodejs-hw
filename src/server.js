// src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors as celebrateErrors } from 'celebrate';

const app = express();

app.use(logger);
app.use(cors());
app.use(express.json());

// Роуті
app.use(notesRoutes);

// Celebrate errors handler (повинен бути перед загальним errorHandler)
app.use(celebrateErrors());

// 404
app.use(notFoundHandler);

// загальний error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

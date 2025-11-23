import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

import { celebrate, Segments } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js'; // <-- ІМПОРТ

const router = Router();

router.use('/notes', authenticate);

router.get(
  '/notes',
  celebrate({ [Segments.QUERY]: getAllNotesSchema }),
  getAllNotes,
);

router.get(
  '/notes/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  getNoteById,
);

router.post(
  '/notes',
  celebrate({ [Segments.BODY]: createNoteSchema }),
  createNote,
);

router.patch(
  '/notes/:noteId',
  celebrate({
    [Segments.PARAMS]: noteIdSchema,
    [Segments.BODY]: updateNoteSchema,
  }),
  updateNote,
);

router.delete(
  '/notes/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  deleteNote,
);

export default router;

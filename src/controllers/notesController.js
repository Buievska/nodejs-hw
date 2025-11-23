// src/controllers/notesController.js
import createHttpError from 'http-errors';
import Note from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const pageNum = Number(page);
    const perPageNum = Number(perPage);

    const userId = req.user._id;

    const filter = { userId };
    if (tag) filter.tag = tag;
    if (search && search.trim() !== '') {
      filter.$text = { $search: search };
    }

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .skip((pageNum - 1) * perPageNum)
        .limit(perPageNum)
        .sort({ createdAt: -1 }),
    ]);

    const totalPages = Math.ceil(totalNotes / perPageNum) || 1;

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user._id;

    const note = await Note.create({ ...data, userId });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const data = req.body;
    const userId = req.user._id;

    const updated = await Note.findOneAndUpdate({ _id: noteId, userId }, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw createHttpError(404, 'Note not found');

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const deleted = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!deleted) throw createHttpError(404, 'Note not found');

    res.status(200).json(deleted);
  } catch (err) {
    next(err);
  }
};

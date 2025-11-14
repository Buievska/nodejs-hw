// src/controllers/notesController.js
import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const pageNum = Number(page);
    const perPageNum = Number(perPage);

    const filter = {};
    if (tag) filter.tag = tag;
    if (search && search.trim() !== '') {
      filter.$text = { $search: search };
    }

    const totalNotes = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalNotes / perPageNum) || 1;

    const notes = await Note.find(filter)
      .skip((pageNum - 1) * perPageNum)
      .limit(perPageNum)
      .sort({ createdAt: -1 });

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
    const note = await Note.findById(noteId);
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const data = req.body;
    const note = await Note.create(data);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const data = req.body;
    const updated = await Note.findByIdAndUpdate(noteId, data, { new: true });
    if (!updated) throw createHttpError(404, 'Note not found');
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const deleted = await Note.findByIdAndDelete(noteId);
    if (!deleted) throw createHttpError(404, 'Note not found');
    res.status(200).json(deleted);
  } catch (err) {
    next(err);
  }
};

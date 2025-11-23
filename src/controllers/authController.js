// src/controllers/authController.js
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import Session from '../models/session.js';
import {
  createSession,
  setSessionCookies,
  clearSessionCookies,
} from '../services/auth.js';

const BCRYPT_SALT_ROUNDS = 10;

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(400, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({ email, password: hashedPassword });

    const session = await createSession(newUser._id);
    setSessionCookies(res, session);

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const passwordValid = await user.checkPassword(password);
    if (!passwordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    await Session.deleteOne({ userId: user._id });
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await Session.findOne({
      _id: sessionId,
      refreshToken,
    });

    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    const isRefreshTokenExpired =
      new Date() > new Date(session.refreshTokenValidUntil);
    if (isRefreshTokenExpired) {
      await Session.deleteOne({ _id: sessionId });
      clearSessionCookies(res);
      throw createHttpError(401, 'Session token expired');
    }

    await Session.deleteOne({ _id: sessionId });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    clearSessionCookies(res);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

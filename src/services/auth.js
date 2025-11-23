// src/services/auth.js
import crypto from 'node:crypto';
import Session from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

const generateRandomToken = () => crypto.randomBytes(32).toString('base64');

/**
 * Створює access та refresh токени, створює сесію в базі даних і повертає її.
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<Session>}
 */
export const createSession = async (userId) => {
  const accessToken = generateRandomToken();
  const refreshToken = generateRandomToken();

  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(now.getTime() + ONE_DAY);

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};

/**
 * Додає до відповіді три кукі: accessToken, refreshToken, sessionId.
 * @param {express.Response} res
 * @param {Session} session
 */
export const setSessionCookies = (res, session) => {
  const { accessToken, refreshToken, _id: sessionId } = session;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // accessToken (15 хв)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: FIFTEEN_MINUTES,
  });

  // refreshToken (1 день)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });

  // sessionId (1 день)
  res.cookie('sessionId', sessionId, {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });
};

/**
 * Очищає всі сесійні кукі.
 * @param {express.Response} res
 */
export const clearSessionCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');
};

import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';

const DEFAULT_PASSWORD_HASH = 'a096178e4ff371d9450541f8b253c07476bee0111d311f02c3642dce8b4fd147';
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_MINUTES = 15;
const DEFAULT_SESSION_MINUTES = 60;

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'default-secret-change-in-production-' + DEFAULT_PASSWORD_HASH;
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export const getSessionDurationMs = () => {
  const minutes = parsePositiveInteger(process.env.ADMIN_SESSION_MINUTES, DEFAULT_SESSION_MINUTES);
  return minutes * 60 * 1000;
};

export const loadAuthConfig = () => {
  const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? DEFAULT_PASSWORD_HASH).trim();
  const safePasswordHash = passwordHash.length > 0 ? passwordHash : DEFAULT_PASSWORD_HASH;
  const maxAttempts = parsePositiveInteger(process.env.ADMIN_MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS);
  const lockoutMinutes = parsePositiveInteger(process.env.ADMIN_LOCKOUT_MINUTES, DEFAULT_LOCKOUT_MINUTES);
  const sessionMinutes = parsePositiveInteger(process.env.ADMIN_SESSION_MINUTES, DEFAULT_SESSION_MINUTES);

  return { passwordHash: safePasswordHash, maxAttempts, lockoutMinutes, sessionMinutes };
};

export const hashPassword = (password) => createHash('sha256').update(password).digest('hex');

export const buildSecurityStatus = (config) => {
  return {
    locked: false,
    remainingMs: 0,
    remainingAttempts: config.maxAttempts,
    maxAttempts: config.maxAttempts,
    lockoutMinutes: config.lockoutMinutes,
  };
};

export const createSessionToken = () => {
  const payload = {
    admin: true,
    iat: Math.floor(Date.now() / 1000),
  };
  
  const expiresIn = Math.floor(getSessionDurationMs() / 1000);
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (handler) => async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
  }

  const token = header.slice(7).trim();
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.admin) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  req.adminToken = token;
  req.tokenData = decoded;
  return handler(req, res);
};

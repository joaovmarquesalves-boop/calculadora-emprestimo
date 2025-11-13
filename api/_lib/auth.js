import { createHash, randomBytes } from 'crypto';

const DEFAULT_PASSWORD_HASH = 'a096178e4ff371d9450541f8b253c07476bee0111d311f02c3642dce8b4fd147';
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_MINUTES = 15;
const DEFAULT_SESSION_MINUTES = 60;

const activeSessions = new Map();
let failedAttempts = 0;
let lockoutUntil = 0;

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

export const refreshLockout = () => {
  if (lockoutUntil && Date.now() >= lockoutUntil) {
    failedAttempts = 0;
    lockoutUntil = 0;
  }
};

export const buildSecurityStatus = (config) => {
  refreshLockout();
  const locked = lockoutUntil > Date.now();
  const remainingMs = locked ? lockoutUntil - Date.now() : 0;
  const remainingAttempts = locked ? 0 : Math.max(config.maxAttempts - failedAttempts, 0);

  return {
    locked,
    remainingMs,
    remainingAttempts,
    maxAttempts: config.maxAttempts,
    lockoutMinutes: config.lockoutMinutes,
  };
};

export const createSessionToken = () => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + getSessionDurationMs();
  activeSessions.set(token, expiresAt);
  return token;
};

export const refreshSession = (token) => {
  if (!activeSessions.has(token)) {
    return false;
  }

  const expiresAt = activeSessions.get(token);
  if (!expiresAt || Date.now() > expiresAt) {
    activeSessions.delete(token);
    return false;
  }

  activeSessions.set(token, Date.now() + getSessionDurationMs());
  return true;
};

export const requireAuth = (handler) => async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
  }

  const token = header.slice(7).trim();
  if (!refreshSession(token)) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  req.adminToken = token;
  return handler(req, res);
};

export const getFailedAttempts = () => failedAttempts;
export const setFailedAttempts = (value) => { failedAttempts = value; };
export const getLockoutUntil = () => lockoutUntil;
export const setLockoutUntil = (value) => { lockoutUntil = value; };
export const getActiveSessions = () => activeSessions;

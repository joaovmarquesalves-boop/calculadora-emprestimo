import {
  loadAuthConfig,
  buildSecurityStatus,
  hashPassword,
  createSessionToken,
  setFailedAttempts,
  setLockoutUntil,
  getFailedAttempts,
} from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { password } = req.body ?? {};
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Informe a senha de acesso.' });
    }

    const config = loadAuthConfig();
    const status = buildSecurityStatus(config);

    if (status.locked) {
      return res.json({ success: false, status });
    }

    const providedHash = hashPassword(password);
    if (providedHash !== config.passwordHash) {
      const newAttempts = getFailedAttempts() + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= config.maxAttempts) {
        setLockoutUntil(Date.now() + config.lockoutMinutes * 60 * 1000);
      }

      return res.json({ success: false, status: buildSecurityStatus(config) });
    }

    setFailedAttempts(0);
    setLockoutUntil(0);
    const token = createSessionToken();
    return res.json({ success: true, token, status: buildSecurityStatus(config) });
  } catch (error) {
    console.error('Erro ao processar login administrativo:', error);
    return res.status(500).json({ error: 'Não foi possível processar o login.' });
  }
}

import {
  requireAuth,
  loadAuthConfig,
  buildSecurityStatus,
  hashPassword,
  setFailedAttempts,
  setLockoutUntil,
  getActiveSessions,
  getSessionDurationMs,
} from './_lib/auth.js';

async function passwordHandler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { newPassword } = req.body ?? {};
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' });
    }

    const config = loadAuthConfig();
    const newHash = hashPassword(newPassword);

    // Na Vercel, não podemos modificar variáveis de ambiente permanentemente
    // A senha só pode ser alterada via dashboard da Vercel
    console.warn('Tentativa de alterar senha - configure ADMIN_PASSWORD_HASH nas variáveis de ambiente da Vercel');

    setFailedAttempts(0);
    setLockoutUntil(0);

    const activeSessions = getActiveSessions();
    for (const token of activeSessions.keys()) {
      if (token !== req.adminToken) {
        activeSessions.delete(token);
      }
    }
    activeSessions.set(req.adminToken, Date.now() + getSessionDurationMs());

    const updatedConfig = {
      ...config,
      passwordHash: newHash,
    };

    return res.json({ 
      success: true, 
      status: buildSecurityStatus(updatedConfig),
      warning: 'Para alterar a senha permanentemente, configure ADMIN_PASSWORD_HASH nas variáveis de ambiente da Vercel'
    });
  } catch (error) {
    console.error('Erro ao processar atualização de senha:', error);
    return res.status(500).json({ error: 'Não foi possível processar a solicitação.' });
  }
}

export default requireAuth(passwordHandler);

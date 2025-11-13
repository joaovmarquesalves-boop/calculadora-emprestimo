import {
  requireAuth,
  loadAuthConfig,
  buildSecurityStatus,
  hashPassword,
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

    console.warn('Tentativa de alterar senha - configure ADMIN_PASSWORD_HASH nas variáveis de ambiente da Vercel');
    console.log('Novo hash da senha:', newHash);

    const updatedConfig = {
      ...config,
      passwordHash: newHash,
    };

    return res.json({ 
      success: true, 
      status: buildSecurityStatus(updatedConfig),
      warning: 'Para alterar a senha permanentemente, configure ADMIN_PASSWORD_HASH nas variáveis de ambiente da Vercel',
      newHash: newHash
    });
  } catch (error) {
    console.error('Erro ao processar atualização de senha:', error);
    return res.status(500).json({ error: 'Não foi possível processar a solicitação.' });
  }
}

export default requireAuth(passwordHandler);

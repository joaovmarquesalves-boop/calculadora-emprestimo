import { loadAuthConfig, buildSecurityStatus } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const config = loadAuthConfig();
    return res.json(buildSecurityStatus(config));
  } catch (error) {
    console.error('Erro ao carregar configuração de segurança:', error);
    return res.status(500).json({ error: 'Não foi possível carregar o status de segurança.' });
  }
}

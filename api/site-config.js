import { DEFAULT_SITE_CONFIG } from './_lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Na Vercel, use variável de ambiente para configuração personalizada
    const customConfig = process.env.SITE_CONFIG 
      ? JSON.parse(process.env.SITE_CONFIG)
      : DEFAULT_SITE_CONFIG;

    return res.json(customConfig);
  } catch (error) {
    console.error('Erro ao ler configuração do site:', error);
    return res.json(DEFAULT_SITE_CONFIG);
  }
}

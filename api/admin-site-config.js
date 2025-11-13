import { requireAuth } from './_lib/auth.js';

async function siteConfigHandler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Corpo de requisição inválido.' });
    }

    // Na Vercel, não podemos persistir em arquivo
    // A configuração deve ser salva nas variáveis de ambiente via dashboard
    console.log('Configuração recebida (salve manualmente na Vercel):', JSON.stringify(body));

    return res.json({ 
      success: true,
      warning: 'Configure SITE_CONFIG nas variáveis de ambiente da Vercel para persistir as alterações'
    });
  } catch (error) {
    console.error('Erro ao processar configuração do site:', error);
    return res.status(500).json({ error: 'Não foi possível processar a configuração.' });
  }
}

export default requireAuth(siteConfigHandler);

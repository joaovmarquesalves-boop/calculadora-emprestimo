import { requireAuth } from './_lib/auth.js';

async function logoutHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  return res.status(204).end();
}

export default requireAuth(logoutHandler);

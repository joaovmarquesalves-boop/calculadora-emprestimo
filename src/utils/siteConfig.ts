const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').replace(/\/$/, '');
const buildUrl = (path: string) => `${API_BASE}${path}`;

export const fetchSiteConfig = async (): Promise<any> => {
  const url = buildUrl('/api/site-config') || '/api/site-config';
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao buscar configuração do servidor.');
  }
  return response.json();
};

export const saveSiteConfig = async (token: string, config: any): Promise<void> => {
  const url = buildUrl('/api/admin/site-config') || '/api/admin/site-config';
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    // Read text once (avoids "body stream already read" errors) and try to parse JSON
    const text = await response.text();
    try {
      const data = text ? JSON.parse(text) : null;
      throw new Error((data && data.error) || text || 'Falha ao salvar configuração no servidor.');
    } catch (err) {
      // If parsing failed, fallback to raw text message or generic
      throw new Error(text || 'Falha ao salvar configuração no servidor.');
    }
  }
};

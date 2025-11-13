export type SecurityStatus = {
  locked: boolean;
  remainingMs: number;
  remainingAttempts: number;
  maxAttempts: number;
  lockoutMinutes: number;
};

export type LoginResult = {
  success: boolean;
  status: SecurityStatus;
  token?: string;
};

const API_BASE_URL = (import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').replace(/\/$/, '');

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const parseErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data && typeof data.error === 'string') {
      return data.error;
    }
    return 'Falha ao processar a solicitação.';
  } catch (error) {
    console.warn('Resposta inválida do servidor administrativo:', error);
    return 'Falha ao processar a solicitação.';
  }
};

const requestJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as T;
};

export const fetchSecurityStatus = async (): Promise<SecurityStatus> =>
  requestJson<SecurityStatus>(buildUrl('/api/admin/security'), {
    credentials: 'include',
  });

export const loginWithPassword = async (password: string): Promise<LoginResult> =>
  requestJson<LoginResult>(buildUrl('/api/admin/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
    credentials: 'include',
  });

type UpdatePasswordResponse = {
  success: boolean;
  status: SecurityStatus;
};

export const updateAdminPassword = async (token: string, newPassword: string): Promise<SecurityStatus> => {
  const result = await requestJson<UpdatePasswordResponse>(buildUrl('/api/admin/password'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
    credentials: 'include',
  });

  return result.status;
};

export const logoutAdmin = async (token: string) => {
  try {
    await fetch(buildUrl('/api/admin/logout'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
  } catch (error) {
    console.warn('Não foi possível encerrar a sessão administrativa:', error);
  }
};

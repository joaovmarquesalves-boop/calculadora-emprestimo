import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { createHash, randomBytes } from 'crypto';

const ENV_PATH = path.resolve(process.cwd(), '.env');
const DEFAULT_PASSWORD_HASH = 'a096178e4ff371d9450541f8b253c07476bee0111d311f02c3642dce8b4fd147';
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_MINUTES = 15;
const DEFAULT_SESSION_MINUTES = 60;

// Default site configuration (kept in JSON file at data/site-config.json).
// This mirrors the client-side `defaultConfig` and is used to bootstrap a
// server-side config file when the project is started for the first time.
const DEFAULT_SITE_CONFIG = {
  header: {
    companyName: 'Consignado 99',
    tagline: 'Atendimento exclusivo para servidores públicos federais, estaduais e INSS',
  },
  hero: {
    badgeText: 'Taxa exclusiva para servidores públicos',
    title: 'Simule seu Empréstimo Consignado Público em segundos',
    description:
      'Condições especiais com até 72 parcelas, taxas a partir de 1,7% ao mês e liberação rápida direto na sua conta. Segurança, transparência e atendimento digital humanizado.',
    bullets: [
      'Sem consulta ao SPC/Serasa',
      'Contratação 100% digital',
      'Atendimento personalizado via WhatsApp',
    ],
  },
  calculator: {
    minAmount: 3000,
    maxAmount: 240000,
    step: 1000,
    defaultAmount: 50000,
    defaultInstallments: 48,
    installmentOptions: [24, 36, 48, 72],
    interestRate: 0.017,
    defaultMode: 'installment',
  },
  advantages: {
    label: 'Por que escolher a Consignado 99',
    title: 'A fintech de consignado com experiência premium',
    description:
      'Combinamos tecnologia e relacionamento próximo para garantir a melhor taxa e uma jornada sem atritos para servidores públicos.',
    items: [
      {
        icon: 'shield',
        title: 'Segurança nível bancário',
        description: 'Credenciamento completo no Banco Central e convênios oficiais para garantir proteção total.',
      },
      {
        icon: 'clock',
        title: 'Liberação em poucas horas',
        description: 'Time dedicado acompanha toda a jornada para que o crédito caia rápido na sua conta.',
      },
      {
        icon: 'smartphone',
        title: 'Atendimento humano digital',
        description: 'Especialistas disponíveis pelo WhatsApp para explicar cada etapa sem burocracia.',
      },
      {
        icon: 'trending',
        title: 'Taxas transparentes',
        description: 'Simulação com custo efetivo total antes da contratação, sem letras miúdas ou surpresas.',
      },
    ],
  },
  howToApply: {
    title: 'Como contratar em 4 passos',
    description:
      'Nosso fluxo é 100% digital, com suporte consultivo humano durante toda a jornada. Transparência total do início ao fim.',
    ctaLabel: 'Ver lista de documentos necessários →',
    ctaLink: '#',
    steps: [
      {
        title: 'Simule em segundos',
        description: 'Use a calculadora para escolher o valor ideal e visualize imediatamente o custo da parcela.',
      },
      {
        title: 'Envie seus dados',
        description: 'Receba o atendimento consultivo de um especialista pelo WhatsApp e tire todas as dúvidas.',
      },
      {
        title: 'Envie a documentação',
        description: 'Colete e assine digitalmente com total segurança. Sem necessidade de deslocamento.',
      },
      {
        title: 'Receba o valor na conta',
        description: 'Após a aprovação do convênio, o crédito é creditado diretamente na conta salário do cliente, geralmente em até 24 horas úteis.',
      },
    ],
  },
  faq: {
    title: 'Perguntas frequentes',
    description:
      'Esclarecemos as principais dúvidas para você contratar com segurança. Precisa de mais detalhes? Fale com um especialista.',
    items: [
      {
        question: 'Quem pode contratar o empréstimo consignado da Consignado 99?',
        answer:
          'Atendemos servidores públicos federais (SIAPE), estaduais conveniados, aposentados e pensionistas do INSS, além de servidores municipais com convênio ativo.',
      },
      {
        question: 'Qual é a taxa de juros aplicada?',
        answer:
          'Trabalhamos com taxas a partir de 1,7% ao mês, variando de acordo com o convênio e a análise de crédito. A simulação já apresenta uma estimativa transparente.',
      },
      {
        question: 'É necessário ir até uma agência física?',
        answer:
          'Não. Todo o processo é 100% digital. Você envia seus documentos, assina eletronicamente e acompanha o andamento pelo WhatsApp.',
      },
      {
        question: 'Em quanto tempo o dinheiro é liberado?',
        answer:
          'Após a aprovação do órgão conveniado, o crédito é creditado diretamente na conta salário do cliente, geralmente em até 24 horas úteis.',
      },
    ],
  },
  footer: {
    title: 'Consignado 99 Correspondente Bancário',
    registration: 'CNPJ 45.123.456/0001-99 • Autorizado pelo Banco Central do Brasil',
    address: 'Endereço: Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    schedule: 'Horário de atendimento: Segunda à sexta das 8h às 18h. Sábados das 9h às 13h.',
    contact: 'Ouvidoria: ouvidoria@consignado99.com.br • SAC: 0800 123 0099',
    whatsapp: '',
    footerLogoUrl: '',
  },
  audiences: {
    title: 'Quem pode contratar com a Consignado 99?',
    description: 'Atendemos diferentes perfis com condições personalizadas. Escolha o seu perfil para ver como funciona a contratação.',
    items: [
      {
        title: 'Aposentados e pensionistas do INSS',
        description: 'Linha exclusiva com descontos em folha e liberação rápida direto na conta benefício.',
        highlights: [
          'Margem consignável automática',
          'Sem consulta ao SPC/Serasa',
          'Taxas reduzidas garantidas por lei',
        ],
      },
      {
        title: 'Servidores federais (SIAPE)',
        description: 'Convênios ativos para todos os órgãos federais com acompanhamento dedicado até a liberação.',
        highlights: [
          'Prazo de até 96 parcelas',
          'Contratação 100% digital',
          'Especialistas em SIAPE para suporte',
        ],
      },
      {
        title: 'Servidores estaduais e municipais',
        description: 'Atendimento para secretarias de educação, segurança e prefeituras conveniadas em todo o Brasil.',
        highlights: [
          'Avaliação rápida da margem disponível',
          'Renegociação de contratos antigos',
          'Suporte jurídico em convênios locais',
        ],
      },
      {
        title: 'Forças Armadas e militares',
        description: 'Soluções para Exército, Marinha, Aeronáutica e forças auxiliares com canais de atendimento dedicados.',
        highlights: [
          'Margem exclusiva para militares ativos e inativos',
          'Documentação simplificada',
          'Equipe especialista em consignado militar',
        ],
      },
    ],
  },
  company: {
    enabled: true,
    heroTitle: 'Uma fintech criada por especialistas em consignado',
    heroSubtitle:
      'Nossa equipe combina experiência de mercado com tecnologia própria para entregar crédito com responsabilidade e proximidade humana.',
    mission:
      'Democratizar o acesso ao crédito consignado com total transparência, oferecendo jornadas digitais eficientes e consultivas.',
    vision:
      'Ser a principal referência em consignado digital no Brasil, reconhecida pela inovação e pelo atendimento humanizado.',
    history:
      'Fundada em 2016, a Consignado 99 nasceu para simplificar o acesso ao crédito consignado. Somos correspondentes bancários autorizados com atuação nacional, atendendo milhares de servidores e aposentados com ética, agilidade e respeito.',
    values: [
      'Transparência em cada etapa da contratação',
      'Inovação contínua em produtos e atendimento',
      'Foco em relações de longo prazo com clientes',
      'Compromisso com a educação financeira do servidor público',
    ],
  },
  leadForm: {
    title: 'Receba sua simulação personalizada',
    description: 'Informe seus dados que nossa equipe especializada enviará todos os detalhes pelo WhatsApp.',
    buttonLabel: 'Receber Simulação no WhatsApp',
    fields: [
      {
        name: 'name',
        label: 'Nome completo',
        type: 'text',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        name: 'phone',
        label: 'Telefone',
        type: 'tel',
        required: true,
      },
      {
        name: 'organization',
        label: 'Órgão/Convênio',
        type: 'select',
        required: true,
        options: ['INSS', 'SIAPE', 'SEDUC', 'PREFEITURA', 'OUTRO'],
      },
    ],
    steps: [
      {
        title: 'Contato',
        fields: ['name', 'phone'],
      },
      {
        title: 'Dados',
        fields: ['email'],
      },
      {
        title: 'Convênio',
        fields: ['organization'],
      },
    ],
  },
  loanTypes: [
    {
      id: 'inss',
      slug: 'inss',
      label: 'INSS',
      interestRate: 0.017,
      order: 1,
      active: true,
    },
    {
      id: 'siape',
      slug: 'siape',
      label: 'Servidor Público',
      interestRate: 0.016,
      order: 2,
      active: true,
    },
    {
      id: 'militar',
      slug: 'militar',
      label: 'Forças Armadas',
      interestRate: 0.018,
      order: 3,
      active: true,
    },
  ],
};

const ensureEnvFile = () => {
  if (fs.existsSync(ENV_PATH)) {
    return;
  }

  const initialContent = [
    '# Configurações do painel administrativo',
    `ADMIN_PASSWORD_HASH=${DEFAULT_PASSWORD_HASH}`,
    `ADMIN_MAX_ATTEMPTS=${DEFAULT_MAX_ATTEMPTS}`,
    `ADMIN_LOCKOUT_MINUTES=${DEFAULT_LOCKOUT_MINUTES}`,
    `ADMIN_SESSION_MINUTES=${DEFAULT_SESSION_MINUTES}`,
    '',
  ].join('\n');

  fs.writeFileSync(ENV_PATH, initialContent, 'utf8');
};

ensureEnvFile();
dotenv.config({ path: ENV_PATH });

// Global process-level handlers to surface uncaught errors during development
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const getSessionDurationMs = () => {
  const minutes = parsePositiveInteger(process.env.ADMIN_SESSION_MINUTES, DEFAULT_SESSION_MINUTES);
  return minutes * 60 * 1000;
};

const readEnvConfig = async () => {
  try {
    const fileContent = await readFile(ENV_PATH, 'utf8');
    return dotenv.parse(fileContent);
  } catch {
    return {};
  }
};

const loadAuthConfig = async () => {
  const fileEnv = await readEnvConfig();
  const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? fileEnv.ADMIN_PASSWORD_HASH ?? DEFAULT_PASSWORD_HASH).trim();
  const safePasswordHash = passwordHash.length > 0 ? passwordHash : DEFAULT_PASSWORD_HASH;
  const maxAttempts = parsePositiveInteger(
    process.env.ADMIN_MAX_ATTEMPTS ?? fileEnv.ADMIN_MAX_ATTEMPTS,
    DEFAULT_MAX_ATTEMPTS,
  );
  const lockoutMinutes = parsePositiveInteger(
    process.env.ADMIN_LOCKOUT_MINUTES ?? fileEnv.ADMIN_LOCKOUT_MINUTES,
    DEFAULT_LOCKOUT_MINUTES,
  );
  const sessionMinutes = parsePositiveInteger(
    process.env.ADMIN_SESSION_MINUTES ?? fileEnv.ADMIN_SESSION_MINUTES,
    DEFAULT_SESSION_MINUTES,
  );

  return { passwordHash: safePasswordHash, maxAttempts, lockoutMinutes, sessionMinutes };
};

const updateEnvValues = async (updates) => {
  ensureEnvFile();
  let lines = [];

  try {
    const current = await readFile(ENV_PATH, 'utf8');
    lines = current.split(/\r?\n/);
  } catch {
    lines = [];
  }

  const seenKeys = new Set();
  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return line;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      return line;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      seenKeys.add(key);
      return `${key}=${updates[key]}`;
    }

    return line;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seenKeys.has(key)) {
      updatedLines.push(`${key}=${value}`);
    }
    process.env[key] = value;
  }

  const finalContent = updatedLines.join('\n');
  await writeFile(ENV_PATH, finalContent.endsWith('\n') ? finalContent : `${finalContent}\n`, 'utf8');
};

const hashPassword = (password) => createHash('sha256').update(password).digest('hex');

let failedAttempts = 0;
let lockoutUntil = 0;
const activeSessions = new Map();

const refreshLockout = () => {
  if (lockoutUntil && Date.now() >= lockoutUntil) {
    failedAttempts = 0;
    lockoutUntil = 0;
  }
};

const buildSecurityStatus = (config) => {
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

const createSessionToken = () => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + getSessionDurationMs();
  activeSessions.set(token, expiresAt);
  return token;
};

const refreshSession = (token) => {
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

const requireSession = (request, response, next) => {
  const header = request.get('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return response.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
  }

  const token = header.slice(7).trim();
  if (!refreshSession(token)) {
    return response.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  request.adminToken = token;
  return next();
};

const app = express();
app.use(express.json());

app.get('/api/admin/security', async (request, response) => {
  try {
    const config = await loadAuthConfig();
    return response.json(buildSecurityStatus(config));
  } catch (error) {
    console.error('Erro ao carregar configuração de segurança:', error);
    return response.status(500).json({ error: 'Não foi possível carregar o status de segurança.' });
  }
});

app.post('/api/admin/login', async (request, response) => {
  try {
    const { password } = request.body ?? {};
    if (typeof password !== 'string' || !password) {
      return response.status(400).json({ error: 'Informe a senha de acesso.' });
    }

    const config = await loadAuthConfig();
    const status = buildSecurityStatus(config);

    if (status.locked) {
      return response.json({ success: false, status });
    }

    const providedHash = hashPassword(password);
    if (providedHash !== config.passwordHash) {
      failedAttempts += 1;
      if (failedAttempts >= config.maxAttempts) {
        lockoutUntil = Date.now() + config.lockoutMinutes * 60 * 1000;
      }

      return response.json({ success: false, status: buildSecurityStatus(config) });
    }

    failedAttempts = 0;
    lockoutUntil = 0;
    const token = createSessionToken();
    return response.json({ success: true, token, status: buildSecurityStatus(config) });
  } catch (error) {
    console.error('Erro ao processar login administrativo:', error);
    return response.status(500).json({ error: 'Não foi possível processar o login.' });
  }
});

app.put('/api/admin/password', requireSession, async (request, response) => {
  try {
    const { newPassword } = request.body ?? {};
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return response
        .status(400)
        .json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' });
    }

    const config = await loadAuthConfig();
    const newHash = hashPassword(newPassword);
    await updateEnvValues({
      ADMIN_PASSWORD_HASH: newHash,
    });

    failedAttempts = 0;
    lockoutUntil = 0;

    for (const token of activeSessions.keys()) {
      if (token !== request.adminToken) {
        activeSessions.delete(token);
      }
    }
    activeSessions.set(request.adminToken, Date.now() + getSessionDurationMs());

    const updatedConfig = {
      ...config,
      passwordHash: newHash,
    };

    return response.json({ success: true, status: buildSecurityStatus(updatedConfig) });
  } catch (error) {
    console.error('Erro ao atualizar a senha do administrador:', error);
    return response.status(500).json({ error: 'Não foi possível atualizar a senha.' });
  }
});

app.post('/api/admin/logout', requireSession, (request, response) => {
  const token = request.adminToken;
  if (token) {
    activeSessions.delete(token);
  }
  return response.status(204).end();
});

// Persistência da configuração do site em arquivo (pública para leitura, protegida para escrita)
const DATA_DIR = path.resolve(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'site-config.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// Ensure a default site-config.json exists on startup to avoid 404s and to
// provide a sane default that mirrors the client default config.
const ensureDefaultSiteConfig = async () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      await writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), 'utf8');
      console.log('Arquivo de configuração do site criado em', CONFIG_FILE);
    }
  } catch (error) {
    console.error('Falha ao garantir o arquivo site-config.json:', error);
  }
};

app.get('/api/site-config', async (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return res.json(DEFAULT_SITE_CONFIG);
    }

    const content = await readFile(CONFIG_FILE, 'utf8');
    try {
      const parsed = JSON.parse(content);
      return res.json(parsed);
    } catch (parseErr) {
      console.error('Falha ao parsear site-config.json:', parseErr);
      return res.json(DEFAULT_SITE_CONFIG);
    }
  } catch (error) {
    console.error('Erro ao ler site-config:', error);
    return res.json(DEFAULT_SITE_CONFIG);
  }
});

app.put('/api/admin/site-config', requireSession, async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Corpo de requisição inválido.' });
    }

    ensureDataDir();
    await writeFile(CONFIG_FILE, JSON.stringify(body, null, 2), 'utf8');
    return res.status(204).end();
  } catch (error) {
    console.error('Erro ao salvar site-config:', error);
    return res.status(500).json({ error: 'Não foi possível salvar a configuração do site.' });
  }
});

const distDirectory = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDirectory)) {
  app.use(express.static(distDirectory));
  app.get('*', (request, response) => {
    response.sendFile(path.join(distDirectory, 'index.html'));
  });
}

// Final express error handler — garante que qualquer erro não tratado devolva JSON
// e evita respostas vazias que quebram o cliente durante parsing.
app.use((err, req, res, next) => {
  console.error('Express error handler caught:', err && err.stack ? err.stack : err);
  if (res.headersSent) {
    return next(err);
  }
  try {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  } catch (sendErr) {
    // Se não for possível enviar JSON, encerra a conexão com status 500
    console.error('Falha ao enviar resposta de erro JSON:', sendErr);
    res.statusCode = 500;
    return res.end('Erro interno do servidor.');
  }
});

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);
// Guarantee default config exists, then start listening
ensureDefaultSiteConfig().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor administrativo ativo na porta ${PORT}`);
  });
});

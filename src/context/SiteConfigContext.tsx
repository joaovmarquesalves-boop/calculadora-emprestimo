import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';

type AdvantageIcon = 'shield' | 'clock' | 'smartphone' | 'trending';

type HeaderConfig = {
  companyName: string;
  tagline: string;
  logoUrl?: string;
};

type HeroConfig = {
  badgeText: string;
  title: string;
  description: string;
  bullets: string[];
};

type CalculatorMode = 'installment' | 'released';

type CalculatorConfig = {
  minAmount: number;
  maxAmount: number;
  step: number;
  defaultAmount: number;
  defaultInstallments: number;
  installmentOptions: number[];
  interestRate: number;
  defaultMode: CalculatorMode;
};

type LoanType = {
  id: string; // identificador único
  slug: string; // ex: 'inss', 'siape'
  label: string; // ex: 'INSS', 'Servidor Público'
  interestRate: number; // taxa mensal (ex: 0.017)
  order?: number;
  active?: boolean;
};

type AdvantageItem = {
  title: string;
  description: string;
  icon: AdvantageIcon;
};

type AdvantagesConfig = {
  label: string;
  title: string;
  description: string;
  items: AdvantageItem[];
};

type HowToApplyStep = {
  title: string;
  description: string;
};

type HowToApplyConfig = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  steps: HowToApplyStep[];
};

type LeadFormFieldType = 'text' | 'email' | 'tel' | 'select' | 'cpf';

type LeadFormField = {
  name: string; // chave usada no form
  label: string;
  type: LeadFormFieldType;
  required?: boolean;
  options?: string[]; // para selects
};

type LeadFormConfig = {
  title: string;
  description: string;
  buttonLabel: string;
  fields: LeadFormField[];
  steps?: { title?: string; fields: string[] }[];
};

type FAQItem = {
  question: string;
  answer: string;
};

type FAQConfig = {
  title: string;
  description: string;
  items: FAQItem[];
};

type AudienceItem = {
  title: string;
  description: string;
  highlights: string[];
};

type AudienceConfig = {
  title: string;
  description: string;
  items: AudienceItem[];
};

type FooterConfig = {
  title: string;
  registration: string;
  address: string;
  schedule: string;
  contact: string;
  footerLogoUrl?: string;
  // Número de WhatsApp no formato livre (pode incluir +55 ou apenas dígitos). Ex.: "+5511912345678" ou "11912345678"
  whatsapp?: string;
};

type CompanyPageConfig = {
  enabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  mission: string;
  vision: string;
  history: string;
  values: string[];
};

type SiteConfig = {
  header: HeaderConfig;
  hero: HeroConfig;
  calculator: CalculatorConfig;
  advantages: AdvantagesConfig;
  howToApply: HowToApplyConfig;
  faq: FAQConfig;
  footer: FooterConfig;
  company: CompanyPageConfig;
  leadForm: LeadFormConfig;
  audiences: AudienceConfig;
  loanTypes?: LoanType[];
};

type SiteConfigContextValue = {
  config: SiteConfig;
  updateConfig: (config: SiteConfig) => void;
  resetConfig: () => void;
  addLoanType: (t: Omit<LoanType, 'id'>) => void;
  updateLoanType: (id: string, next: Partial<LoanType>) => void;
  removeLoanType: (id: string) => void;
};

const defaultConfig: SiteConfig = {
  header: {
    companyName: 'Consignado 99',
    tagline: 'Atendimento exclusivo para servidores públicos federais, estaduais e INSS',
    logoUrl: '',
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
  loanTypes: [
    { id: 'inss', slug: 'inss', label: 'INSS', interestRate: 0.017, order: 1, active: true },
    { id: 'siape', slug: 'siape', label: 'Servidor Público', interestRate: 0.016, order: 2, active: true },
    { id: 'militar', slug: 'militar', label: 'Forças Armadas', interestRate: 0.018, order: 3, active: true },
  ],
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
        description: 'Após a aprovação do convênio, o crédito é liberado direto na sua conta salário.',
      },
    ],
  },
  leadForm: {
    title: 'Receba sua simulação personalizada',
    description: 'Informe seus dados que nossa equipe especializada enviará todos os detalhes pelo WhatsApp.',
    buttonLabel: 'Receber Simulação no WhatsApp',
    fields: [
      { name: 'name', label: 'Nome completo', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Telefone', type: 'tel', required: true },
      { name: 'organization', label: 'Órgão/Convênio', type: 'select', required: true, options: ['INSS', 'SIAPE', 'SEDUC', 'PREFEITURA', 'OUTRO'] },
    ],
    steps: [
      { title: 'Contato', fields: ['name', 'phone'] },
      { title: 'Dados', fields: ['email'] },
      { title: 'Convênio', fields: ['organization'] },
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
  audiences: {
    title: 'Quem pode contratar com a Consignado 99?',
    description:
      'Atendemos diferentes perfis com condições personalizadas. Escolha o seu perfil para ver como funciona a contratação.',
    items: [
      {
        title: 'Aposentados e pensionistas do INSS',
        description:
          'Linha exclusiva com descontos em folha e liberação rápida direto na conta benefício.',
        highlights: [
          'Margem consignável automática',
          'Sem consulta ao SPC/Serasa',
          'Taxas reduzidas garantidas por lei',
        ],
      },
      {
        title: 'Servidores federais (SIAPE)',
        description:
          'Convênios ativos para todos os órgãos federais com acompanhamento dedicado até a liberação.',
        highlights: [
          'Prazo de até 96 parcelas',
          'Contratação 100% digital',
          'Especialistas em SIAPE para suporte',
        ],
      },
      {
        title: 'Servidores estaduais e municipais',
        description:
          'Atendimento para secretarias de educação, segurança e prefeituras conveniadas em todo o Brasil.',
        highlights: [
          'Avaliação rápida da margem disponível',
          'Renegociação de contratos antigos',
          'Suporte jurídico em convênios locais',
        ],
      },
      {
        title: 'Forças Armadas e militares',
        description:
          'Soluções para Exército, Marinha, Aeronáutica e forças auxiliares com canais de atendimento dedicados.',
        highlights: [
          'Margem exclusiva para militares ativos e inativos',
          'Documentação simplificada',
          'Equipe especialista em consignado militar',
        ],
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
};

const CONFIG_STORAGE_KEY = 'site-config';

const normalizeLoanTypes = (items?: any[]) => {
  if (!items) return defaultConfig.loanTypes ?? [];
  return items.map((it) => ({
    ...it,
    order: it?.order !== undefined && it?.order !== null ? Number(it.order) : undefined,
    interestRate: it?.interestRate !== undefined ? Number(it.interestRate) : undefined,
  }));
};

const SiteConfigContext = createContext<SiteConfigContextValue | undefined>(undefined);

const getInitialConfig = (): SiteConfig => {
  if (typeof window === 'undefined') {
    return defaultConfig;
  }

  try {
    const stored = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) {
      return defaultConfig;
    }

    const parsed = JSON.parse(stored) as Partial<SiteConfig>;

    return {
      header: { ...defaultConfig.header, ...parsed.header },
      hero: { ...defaultConfig.hero, ...parsed.hero },
      calculator: { ...defaultConfig.calculator, ...parsed.calculator },
      advantages: {
        ...defaultConfig.advantages,
        ...parsed.advantages,
        items: parsed.advantages?.items ?? defaultConfig.advantages.items,
      },
      howToApply: {
        ...defaultConfig.howToApply,
        ...parsed.howToApply,
        steps: parsed.howToApply?.steps ?? defaultConfig.howToApply.steps,
      },
      faq: {
        ...defaultConfig.faq,
        ...parsed.faq,
        items: parsed.faq?.items ?? defaultConfig.faq.items,
      },
      audiences: {
        ...defaultConfig.audiences,
        ...parsed.audiences,
        items: parsed.audiences?.items ?? defaultConfig.audiences.items,
      },
      footer: { ...defaultConfig.footer, ...parsed.footer },
      company: {
        ...defaultConfig.company,
        ...parsed.company,
        values: parsed.company?.values ?? defaultConfig.company.values,
      },
      leadForm: {
        ...defaultConfig.leadForm,
        ...parsed.leadForm,
        fields: parsed.leadForm?.fields ?? defaultConfig.leadForm.fields,
      },
      loanTypes: normalizeLoanTypes(parsed.loanTypes ?? defaultConfig.loanTypes),
    };
  } catch (error) {
    console.warn('Falha ao carregar configurações salvas:', error);
    return defaultConfig;
  }
};

const normalizeConfig = (partial: Partial<SiteConfig> | undefined): SiteConfig => {
  if (!partial) return defaultConfig;

  return {
    header: { ...defaultConfig.header, ...partial.header },
    hero: { ...defaultConfig.hero, ...partial.hero },
    calculator: { ...defaultConfig.calculator, ...partial.calculator },
    advantages: {
      ...defaultConfig.advantages,
      ...partial.advantages,
      items: partial.advantages?.items ?? defaultConfig.advantages.items,
    },
    howToApply: {
      ...defaultConfig.howToApply,
      ...partial.howToApply,
      steps: partial.howToApply?.steps ?? defaultConfig.howToApply.steps,
    },
    faq: {
      ...defaultConfig.faq,
      ...partial.faq,
      items: partial.faq?.items ?? defaultConfig.faq.items,
    },
    audiences: {
      ...defaultConfig.audiences,
      ...partial.audiences,
      items: partial.audiences?.items ?? defaultConfig.audiences.items,
    },
    footer: { ...defaultConfig.footer, ...partial.footer },
    company: {
      ...defaultConfig.company,
      ...partial.company,
      values: partial.company?.values ?? defaultConfig.company.values,
    },
    leadForm: {
      ...defaultConfig.leadForm,
      ...partial.leadForm,
      fields: partial.leadForm?.fields ?? defaultConfig.leadForm.fields,
      steps: partial.leadForm?.steps ?? defaultConfig.leadForm.steps,
    },
    loanTypes: normalizeLoanTypes(partial.loanTypes ?? defaultConfig.loanTypes),
  };
};

type SiteConfigProviderProps = {
  children: ReactNode;
};

export const SiteConfigProvider = ({ children }: SiteConfigProviderProps) => {
  const [config, setConfig] = useState<SiteConfig>(() => getInitialConfig());

  // Ao montar no cliente, tentar carregar a configuração persistida no servidor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadServerConfig = async () => {
      try {
        const res = await fetch('/api/site-config');
        if (!res.ok) return; // sem config no servidor
        const serverConfig = await res.json();
        if (!serverConfig || typeof serverConfig !== 'object') return;

        // Mescla a config do servidor com os valores padrão para garantir chaves existentes
        const normalized = normalizeConfig(serverConfig as Partial<SiteConfig>);
        setConfig(normalized);
        try {
          window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(normalized));
        } catch (e) {
          // ignore localStorage failures
        }
      } catch (error) {
        console.warn('Não foi possível carregar a configuração do servidor:', error);
      }
    };

    loadServerConfig();
    
    // Ouve eventos que indicam que a configuração foi atualizada em outra aba
    const storageListener = (e: StorageEvent) => {
      if (e.key === CONFIG_STORAGE_KEY) {
        // Atualiza a partir do servidor para garantir consistência
        (async () => {
          try {
            const res = await fetch('/api/site-config');
            if (!res.ok) return;
            const serverConfig = await res.json();
            setConfig(normalizeConfig(serverConfig as Partial<SiteConfig>));
          } catch (err) {
            console.warn('Falha ao atualizar config a partir do evento storage:', err);
          }
        })();
      }
    };

    const customListener = () => {
      // Recarrega a config do servidor quando o evento custom for emitido
      (async () => {
        try {
          const res = await fetch('/api/site-config');
          if (!res.ok) return;
          const serverConfig = await res.json();
          const normalized = normalizeConfig(serverConfig as Partial<SiteConfig>);
          setConfig(normalized);
          try {
            window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(normalized));
          } catch (e) {
            // ignore
          }
        } catch (err) {
          console.warn('Falha ao atualizar config a partir do evento site-config-updated:', err);
        }
      })();
    };

    window.addEventListener('storage', storageListener);
    window.addEventListener('site-config-updated', customListener as EventListener);

    return () => {
      window.removeEventListener('storage', storageListener);
      window.removeEventListener('site-config-updated', customListener as EventListener);
    };
  }, []);

  const updateConfig = (nextConfig: SiteConfig) => {
    setConfig(nextConfig);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
    }
  };

  const addLoanType = (t: Omit<LoanType, 'id'>) => {
    const id = t.slug || Math.random().toString(36).slice(2, 9);
    const newItem: LoanType = { id, ...t } as LoanType;
    const next = { ...config, loanTypes: [...(config.loanTypes ?? []), newItem] } as SiteConfig;
    updateConfig(next);
  };

  const updateLoanType = (id: string, nextFields: Partial<LoanType>) => {
    const next = {
      ...config,
      loanTypes: (config.loanTypes ?? []).map((l) => (l.id === id ? { ...l, ...nextFields } : l)),
    } as SiteConfig;
    updateConfig(next);
  };

  const removeLoanType = (id: string) => {
    const next = { ...config, loanTypes: (config.loanTypes ?? []).filter((l) => l.id !== id) } as SiteConfig;
    updateConfig(next);
  };

  const resetConfig = () => {
    updateConfig(defaultConfig);
  };

  const value = useMemo<SiteConfigContextValue>(
    () => ({ config, updateConfig, resetConfig, addLoanType, updateLoanType, removeLoanType }),
    [config],
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig deve ser usado dentro de um SiteConfigProvider');
  }
  return context;
};

export type {
  AdvantageIcon,
  AudienceConfig,
  AudienceItem,
  CalculatorConfig,
  CalculatorMode,
  SiteConfig,
  LoanType,
};
export { defaultConfig };

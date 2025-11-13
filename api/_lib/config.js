export const DEFAULT_SITE_CONFIG = {
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

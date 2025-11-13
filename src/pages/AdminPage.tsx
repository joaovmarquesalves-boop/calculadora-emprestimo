import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig, CalculatorMode, AdvantageIcon, SiteConfig } from '../context/SiteConfigContext';
import {
  fetchSecurityStatus,
  loginWithPassword,
  logoutAdmin,
  updateAdminPassword,
  type SecurityStatus,
} from '../utils/auth';
import { saveSiteConfig } from '../utils/siteConfig';

const iconOptions: { value: AdvantageIcon; label: string }[] = [
  { value: 'shield', label: 'Escudo (Segurança)' },
  { value: 'clock', label: 'Relógio (Rapidez)' },
  { value: 'smartphone', label: 'Smartphone (Atendimento digital)' },
  { value: 'trending', label: 'Gráfico (Resultados)' },
];

const modeOptions: { value: CalculatorMode; label: string }[] = [
  { value: 'installment', label: 'Calcular valor da parcela' },
  { value: 'released', label: 'Calcular valor liberado' },
];

const DEFAULT_SECURITY_STATUS: SecurityStatus = {
  locked: false,
  remainingMs: 0,
  remainingAttempts: 5,
  maxAttempts: 5,
  lockoutMinutes: 15,
};

const AdminPage = () => {
  const { config, updateConfig, resetConfig } = useSiteConfig();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [formConfig, setFormConfig] = useState<SiteConfig>(config);
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>(DEFAULT_SECURITY_STATUS);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const inputClass =
    'rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white';
  const selectClass = inputClass;
  const textareaClass = (minHeight = 'min-h-[120px]') => `${inputClass} ${minHeight}`;
  const cardClass =
    'space-y-6 rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm shadow-primary/10 backdrop-blur';
  const nestedCardClass = 'grid gap-3 rounded-2xl border border-primary/10 bg-primary-50/60 p-4';
  const pillButtonClass =
    'rounded-xl border border-primary/40 px-3 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10';

  useEffect(() => {
    setFormConfig(config);
  }, [config]);

  const sortedLoanTypes = useMemo(() => {
    const items = (formConfig.loanTypes ?? []).slice();
    items.sort((a: any, b: any) => {
      const ao = Number.isFinite(Number(a?.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
      const bo = Number.isFinite(Number(b?.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      // fallback: alphabetical by label
      return String(a?.label ?? '').localeCompare(String(b?.label ?? ''));
    });
    return items;
  }, [formConfig.loanTypes]);

  useEffect(() => {
    const loadSecurityStatus = async () => {
      try {
        const status = await fetchSecurityStatus();
        setSecurityStatus(status);
        setStatusError('');
      } catch (error) {
        console.warn('Falha ao carregar o status de segurança:', error);
        setStatusError('Não foi possível carregar o status de segurança.');
      }
    };

    loadSecurityStatus();
  }, []);

  useEffect(
    () => () => {
      if (authToken) {
        logoutAdmin(authToken);
      }
    },
    [authToken],
  );

  const formatRemainingTime = (milliseconds: number) => {
    const safeMilliseconds = Math.max(milliseconds, 0);
    const totalSeconds = Math.ceil(safeMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      const minuteLabel = minutes === 1 ? 'minuto' : 'minutos';
      return `${minutes} ${minuteLabel} e ${seconds.toString().padStart(2, '0')}s`;
    }

    return `${seconds}s`;
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsVerifying(true);
    try {
      const result = await loginWithPassword(passwordInput);
      setSecurityStatus(result.status);

      if (result.success) {
        if (!result.token) {
          setLoginError('Sessão inválida. Tente novamente.');
          setPasswordInput('');
          return;
        }

        setIsAuthenticated(true);
        setAuthToken(result.token);
        setPasswordInput('');
        setLoginError('');
        setStatusError('');
        return;
      }

      setPasswordInput('');

      if (result.status.locked) {
        setLoginError(
          `Muitas tentativas inválidas. Tente novamente em ${formatRemainingTime(result.status.remainingMs)}.`,
        );
        return;
      }

      const remainingAttempts = result.status.remainingAttempts;
      const attemptLabel = remainingAttempts === 1 ? 'tentativa' : 'tentativas';
      setLoginError(`Senha inválida. Você ainda tem ${remainingAttempts} ${attemptLabel} antes do bloqueio.`);
    } catch (error) {
      console.warn('Falha ao verificar as credenciais administrativas:', error);
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('Não foi possível validar a senha. Tente novamente.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfigChange = <Section extends keyof SiteConfig, Field extends keyof SiteConfig[Section]>(
    section: Section,
    field: Field,
    value: SiteConfig[Section][Field],
  ) => {
    setFormConfig((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const handleHeroBulletsChange = (value: string) => {
    const bullets = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    handleConfigChange('hero', 'bullets', bullets);
  };

  const handleHowToApplyStepsChange = (
    index: number,
    field: 'title' | 'description',
    value: string,
  ) => {
    setFormConfig((current) => {
      const steps = [...current.howToApply.steps];
      steps[index] = {
        ...steps[index],
        [field]: value,
      };
      return {
        ...current,
        howToApply: {
          ...current.howToApply,
          steps,
        },
      };
    });
  };

  const handleAddHowToApplyStep = () => {
    setFormConfig((current) => ({
      ...current,
      howToApply: {
        ...current.howToApply,
        steps: [
          ...current.howToApply.steps,
          {
            title: 'Novo passo',
            description: 'Descreva a etapa para o cliente.',
          },
        ],
      },
    }));
  };

  const handleRemoveHowToApplyStep = (index: number) => {
    setFormConfig((current) => ({
      ...current,
      howToApply: {
        ...current.howToApply,
        steps: current.howToApply.steps.filter((_, stepIndex) => stepIndex !== index),
      },
    }));
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFormConfig((current) => {
      const items = [...current.faq.items];
      items[index] = {
        ...items[index],
        [field]: value,
      };
      return {
        ...current,
        faq: {
          ...current.faq,
          items,
        },
      };
    });
  };

  const handleAddFAQItem = () => {
    setFormConfig((current) => ({
      ...current,
      faq: {
        ...current.faq,
        items: [
          ...current.faq.items,
          {
            question: 'Nova pergunta',
            answer: 'Adicione aqui a resposta completa.',
          },
        ],
      },
    }));
  };

  const handleRemoveFAQItem = (index: number) => {
    setFormConfig((current) => ({
      ...current,
      faq: {
        ...current.faq,
        items: current.faq.items.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleAdvantageChange = (
    index: number,
    field: 'title' | 'description' | 'icon',
    value: string,
  ) => {
    setFormConfig((current) => {
      const items = [...current.advantages.items];
      items[index] = {
        ...items[index],
        [field]: field === 'icon' ? (value as AdvantageIcon) : value,
      };
      return {
        ...current,
        advantages: {
          ...current.advantages,
          items,
        },
      };
    });
  };

  const handleAddAdvantage = () => {
    setFormConfig((current) => ({
      ...current,
      advantages: {
        ...current.advantages,
        items: [
          ...current.advantages.items,
          {
            icon: 'shield',
            title: 'Novo destaque',
            description: 'Explique o benefício oferecido ao cliente.',
          },
        ],
      },
    }));
  };

  const handleRemoveAdvantage = (index: number) => {
    setFormConfig((current) => ({
      ...current,
      advantages: {
        ...current.advantages,
        items: current.advantages.items.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleCompanyValuesChange = (value: string) => {
    const values = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    handleConfigChange('company', 'values', values);
  };

  const handleAudiencesChange = <Field extends keyof SiteConfig['audiences']>(
    field: Field,
    value: SiteConfig['audiences'][Field],
  ) => {
    setFormConfig((current) => ({
      ...current,
      audiences: {
        ...current.audiences,
        [field]: value,
      },
    }));
  };

  const handleAudienceItemChange = (
    index: number,
    field: 'title' | 'description',
    value: string,
  ) => {
    setFormConfig((current) => {
      const items = [...current.audiences.items];
      items[index] = {
        ...items[index],
        [field]: value,
      };
      return {
        ...current,
        audiences: {
          ...current.audiences,
          items,
        },
      };
    });
  };

  const handleAudienceHighlightsChange = (index: number, value: string) => {
    const highlights = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    setFormConfig((current) => {
      const items = [...current.audiences.items];
      items[index] = {
        ...items[index],
        highlights,
      };
      return {
        ...current,
        audiences: {
          ...current.audiences,
          items,
        },
      };
    });
  };

  const handleAddAudienceItem = () => {
    setFormConfig((current) => ({
      ...current,
      audiences: {
        ...current.audiences,
        items: [
          ...current.audiences.items,
          {
            title: 'Novo público',
            description: 'Descreva como atendemos esse perfil.',
            highlights: ['Diferencial 1', 'Diferencial 2'],
          },
        ],
      },
    }));
  };

  const handleRemoveAudienceItem = (index: number) => {
    setFormConfig((current) => ({
      ...current,
      audiences: {
        ...current.audiences,
        items: current.audiences.items.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleInstallmentOptionsChange = (value: string) => {
    const options = value
      .split(',')
      .map((item) => parseInt(item.trim(), 10))
      .filter((option) => !Number.isNaN(option) && option > 0);
    handleConfigChange('calculator', 'installmentOptions', options);
  };

  const buildWhatsappDigits = (raw: string | undefined | null) => {
    if (!raw) return null;
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return null;

    // Já tem country code
    if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) return digits;

    // DDD + número (10 ou 11) -> prefixa 55
    if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) return `55${digits}`;

    // Se tiver 12/13 sem 55, tenta prefixar
    if (digits.length === 12 || digits.length === 13) return `55${digits}`;

    return null;
  };

  const isWhatsappValid = (raw: string | undefined | null) => !!buildWhatsappDigits(raw);

  const handleInterestRateChange = (value: string) => {
    const sanitized = value.replace(',', '.');
    if (!sanitized.trim()) {
      handleConfigChange('calculator', 'interestRate', 0);
      return;
    }
    const parsed = Number.parseFloat(sanitized);
    if (Number.isFinite(parsed)) {
      handleConfigChange('calculator', 'interestRate', Math.max(parsed / 100, 0));
    }
  };

  const interestRateField = useMemo(
    () => (formConfig.calculator.interestRate * 100).toFixed(2),
    [formConfig.calculator.interestRate],
  );

  const handleSubmitConfig = () => {
    setIsSaving(true);
    updateConfig(formConfig);
    setFeedback('Configurações salvas localmente.');

    // Tenta persistir no servidor se houver sessão autenticada
    (async () => {
      if (!authToken) {
        setTimeout(() => setFeedback(''), 4000);
        return;
      }

      try {
        await saveSiteConfig(authToken, formConfig);

        // Após publicar com sucesso, buscar a configuração no servidor para
        // garantir que o provider local e outras abas recebam a versão atual.
        try {
          const apiBase = (import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').replace(/\/$/, '');
          const fetchUrl = apiBase ? `${apiBase}/api/site-config` : '/api/site-config';
          const res = await fetch(fetchUrl);
          if (res.ok) {
            const serverConfig = await res.json();
            // Atualiza provider + localStorage
            updateConfig(serverConfig);
            setFormConfig(serverConfig);
            // Notifica outras abas (storage event não dispara na mesma aba)
            try {
              window.dispatchEvent(new Event('site-config-updated'));
            } catch (e) {
              // ignore
            }
          }
        } catch (err) {
          console.warn('Falha ao buscar configuração do servidor após publish:', err);
        }

        setFeedback('Configurações publicadas no servidor com sucesso.');
      } catch (error) {
        console.warn('Falha ao publicar configuração no servidor:', error);
        const message = error instanceof Error ? error.message : 'Falha ao publicar no servidor.';
        setFeedback(`Salvo localmente. ${message}`);
      } finally {
        setTimeout(() => setFeedback(''), 4000);
      }
    })().finally(() => setIsSaving(false));
  };

  const isDirty = useMemo(() => JSON.stringify(formConfig) !== JSON.stringify(config), [formConfig, config]);

  const handleResetConfig = () => {
    resetConfig();
    setFeedback('Configurações restauradas para o padrão.');
    setTimeout(() => setFeedback(''), 4000);
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPassword) {
      setFeedback('Informe uma nova senha para atualizar.');
      return;
    }

    if (newPassword.length < 8) {
      setFeedback('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }

    if (!authToken) {
      setFeedback('Sua sessão expirou. Faça login novamente.');
      setTimeout(() => setFeedback(''), 4000);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const status = await updateAdminPassword(authToken, newPassword);
      setSecurityStatus(status);
      setStatusError('');
      setNewPassword('');
      setFeedback('Senha atualizada com sucesso e salva no arquivo .env.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (error) {
      console.warn('Falha ao atualizar a senha de administrador:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a senha. Tente novamente.';
      setFeedback(message);
      if (error instanceof Error && error.message.includes('Sessão')) {
        setIsAuthenticated(false);
        setAuthToken(null);
        setPasswordInput('');
        setLoginError(error.message);
      }
      setTimeout(() => setFeedback(''), 4000);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!isAuthenticated) {
    const loginDisabled = securityStatus.locked || isVerifying;
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
        <form
          className="w-full max-w-md space-y-6 rounded-3xl border border-primary/10 bg-white/95 p-8 shadow-lg shadow-primary/10 backdrop-blur"
          onSubmit={handleLogin}
        >
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-primary-900">Área administrativa</h1>
            <p className="text-sm text-primary-700">
              Insira a senha de administrador para acessar as configurações do site.
            </p>
          </div>
          <label className="grid gap-2 text-sm text-primary-800">
            Senha de acesso
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              className={inputClass}
              required
              disabled={loginDisabled}
            />
          </label>
          <p className="text-xs text-primary-700">
            Máximo de {securityStatus.maxAttempts} tentativas. Após exceder o limite, o acesso é bloqueado por{' '}
            {securityStatus.lockoutMinutes} minutos.
          </p>
          {statusError && <p className="text-xs text-amber-600">{statusError}</p>}
          {loginError && <p className="text-sm text-rose-600">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loginDisabled}
          >
            {isVerifying ? 'Verificando…' : 'Entrar'}
          </button>
          <Link to="/" className="block text-center text-sm font-medium text-primary-700 hover:text-primary-900">
            ← Voltar para o site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-16 text-primary-900">
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary-900">Painel administrativo</h1>
            <p className="text-sm text-primary-700">Gerencie todo o conteúdo exibido no site público.</p>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-primary/30 px-4 py-2 text-sm font-medium text-primary-700 transition hover:border-primary hover:text-primary-900"
          >
            Visualizar site
          </Link>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-6xl flex-col gap-10 px-4 pb-20">
        {feedback && (
          <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary-700 shadow-sm">
            {feedback}
          </div>
        )}

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Identidade e cabeçalho</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-primary-800">
              Nome da empresa
              <input
                value={formConfig.header.companyName}
                onChange={(event) => handleConfigChange('header', 'companyName', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Frase de destaque (cabeçalho)
              <input
                value={formConfig.header.tagline}
                onChange={(event) => handleConfigChange('header', 'tagline', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              URL do logo (deixe em branco para usar o padrão)
              <input
                value={formConfig.header.logoUrl ?? ''}
                onChange={(event) => handleConfigChange('header', 'logoUrl', event.target.value)}
                className={inputClass}
                placeholder="https://exemplo.com/logo.png"
              />
            </label>
          </div>
  </section>

        <section className={cardClass}>
        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tipos de Empréstimo</h2>
            <button
              type="button"
              onClick={() => {
                setFormConfig((current) => {
                  const existing = current.loanTypes ?? [];
                  const maxOrder = existing.length ? Math.max(...existing.map((x: any) => Number(x.order) || 0)) : 0;
                  return {
                    ...current,
                    loanTypes: [
                      ...existing,
                      {
                        id: `loan_${Date.now()}`,
                        slug: `novo-${existing.length + 1}`,
                        label: 'Novo tipo',
                        interestRate: 0.017,
                        order: maxOrder + 1,
                        active: true,
                      },
                    ],
                  };
                });
              }}
              className={pillButtonClass}
            >
              Adicionar tipo
            </button>
          </div>

          <div className="grid gap-4">
            {sortedLoanTypes?.length ? (
              sortedLoanTypes.map((lt: any, idx: number) => (
                <div key={lt.id ?? idx} className={nestedCardClass}>
                  <div className="flex items-center justify-between text-primary-900">
                    <h3 className="text-base font-semibold">{lt.label || `Tipo #${idx + 1}`}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const id = lt.id;
                        setFormConfig((current) => ({
                          ...current,
                          loanTypes: (current.loanTypes ?? []).filter((l: any) => l.id !== id),
                        }));
                      }}
                      className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="grid gap-2 text-sm text-primary-800">
                      Rótulo
                      <input
                        value={lt.label}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = lt.id;
                          setFormConfig((current) => {
                            const items = [...(current.loanTypes ?? [])];
                            const i = items.findIndex((x: any) => x.id === id);
                            if (i !== -1) items[i] = { ...items[i], label: v };
                            return { ...current, loanTypes: items };
                          });
                        }}
                        className={inputClass}
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-primary-800">
                      Slug (identificador)
                      <input
                        value={lt.slug}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\s+/g, '-').toLowerCase();
                          const id = lt.id;
                          setFormConfig((current) => {
                            const items = [...(current.loanTypes ?? [])];
                            const i = items.findIndex((x: any) => x.id === id);
                            if (i !== -1) items[i] = { ...items[i], slug: v };
                            return { ...current, loanTypes: items };
                          });
                        }}
                        className={inputClass}
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-primary-800">
                      Taxa mensal (%)
                      <input
                        value={((lt.interestRate ?? 0) * 100).toFixed(2)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(',', '.');
                          const parsed = Number.parseFloat(raw);
                          const rate = Number.isFinite(parsed) ? Math.max(parsed / 100, 0) : 0;
                          const id = lt.id;
                          setFormConfig((current) => {
                            const items = [...(current.loanTypes ?? [])];
                            const i = items.findIndex((x: any) => x.id === id);
                            if (i !== -1) items[i] = { ...items[i], interestRate: rate };
                            return { ...current, loanTypes: items };
                          });
                        }}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="grid gap-2 text-sm text-primary-800">
                      Ordem (use para ordenar)
                      <input
                        type="number"
                        value={typeof lt.order === 'number' ? lt.order : ((formConfig.loanTypes ?? []).findIndex((x: any) => x.id === lt.id) + 1)}
                        onChange={(e) => {
                          const parsed = parseInt(String(e.target.value), 10);
                          const v = Number.isFinite(parsed) ? parsed : 0;
                          const id = lt.id;
                          setFormConfig((current) => {
                            const items = [...(current.loanTypes ?? [])];
                            const i = items.findIndex((x: any) => x.id === id);
                            if (i !== -1) items[i] = { ...items[i], order: v };
                            return { ...current, loanTypes: items };
                          });
                        }}
                        className={inputClass}
                      />
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-primary-800">
                      <input
                        type="checkbox"
                        checked={!!lt.active}
                        onChange={(e) => {
                          const v = e.target.checked;
                          const id = lt.id;
                          setFormConfig((current) => {
                            const items = [...(current.loanTypes ?? [])];
                            const i = items.findIndex((x: any) => x.id === id);
                            if (i !== -1) items[i] = { ...items[i], active: v };
                            return { ...current, loanTypes: items };
                          });
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Ativo
                    </label>

                    <div />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-primary-700">Nenhum tipo cadastrado ainda. Use "Adicionar tipo" para criar um.</p>
            )}
          </div>
        </section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Modal de contato (Receba sua simulação)</h2>
            <button
              type="button"
              onClick={() => {
                setFormConfig((current) => ({
                  ...current,
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
                  },
                }));
              }}
              className={pillButtonClass}
            >
              Restaurar modal padrão
            </button>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-primary-800">
              Título do modal
              <input
                value={(formConfig as any).leadForm?.title ?? ''}
                onChange={(e) => handleConfigChange('leadForm' as any, 'title' as any, e.target.value as any)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Descrição do modal
              <textarea
                value={(formConfig as any).leadForm?.description ?? ''}
                onChange={(e) => handleConfigChange('leadForm' as any, 'description' as any, e.target.value as any)}
                className={textareaClass('min-h-[80px]')}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Texto do botão
              <input
                value={(formConfig as any).leadForm?.buttonLabel ?? ''}
                onChange={(e) => handleConfigChange('leadForm' as any, 'buttonLabel' as any, e.target.value as any)}
                className={inputClass}
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-primary-900">Campos do formulário</h3>
                <button
                  type="button"
                  onClick={() => {
                    setFormConfig((current) => ({
                      ...current,
                      leadForm: {
                        ...(current.leadForm as any),
                        fields: [
                          ...(current.leadForm?.fields ?? []),
                          { name: `field_${Date.now()}`, label: 'Novo campo', type: 'text', required: false },
                        ],
                      },
                    }));
                  }}
                  className={pillButtonClass}
                >
                  Adicionar campo
                </button>
              </div>

              {(formConfig as any).leadForm?.fields?.map((f: any, idx: number) => (
                <div key={f.name + idx} className={nestedCardClass}>
                  <div className="flex items-center justify-between text-primary-900">
                    <h4 className="text-sm font-semibold">Campo #{idx + 1}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setFormConfig((current) => ({
                          ...current,
                          leadForm: {
                            ...(current.leadForm as any),
                            fields: (current.leadForm?.fields ?? []).filter((_: any, i: number) => i !== idx),
                          },
                        }));
                      }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    >
                      Remover
                    </button>
                  </div>
                  <label className="grid gap-2 text-sm text-primary-800">
                    Nome (chave)
                    <input
                      value={f.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormConfig((current) => {
                          const fields = [...(current.leadForm?.fields ?? [])];
                          fields[idx] = { ...fields[idx], name: v };
                          return { ...current, leadForm: { ...(current.leadForm as any), fields } };
                        });
                      }}
                      className={`${inputClass} px-3 py-2`}
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-primary-800">
                    Rótulo
                    <input
                      value={f.label}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormConfig((current) => {
                          const fields = [...(current.leadForm?.fields ?? [])];
                          fields[idx] = { ...fields[idx], label: v };
                          return { ...current, leadForm: { ...(current.leadForm as any), fields } };
                        });
                      }}
                      className={`${inputClass} px-3 py-2`}
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-primary-800">
                    Tipo
                    <select
                      value={f.type}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormConfig((current) => {
                          const fields = [...(current.leadForm?.fields ?? [])];
                          fields[idx] = { ...fields[idx], type: v as any };
                          return { ...current, leadForm: { ...(current.leadForm as any), fields } };
                        });
                      }}
                      className={`${selectClass} px-3 py-2`}
                    >
                      <option value="text">Texto</option>
                      <option value="email">Email</option>
                      <option value="tel">Telefone</option>
                      <option value="cpf">CPF</option>
                      <option value="select">Select</option>
                    </select>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-primary-800">
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setFormConfig((current) => {
                          const fields = [...(current.leadForm?.fields ?? [])];
                          fields[idx] = { ...fields[idx], required: v };
                          return { ...current, leadForm: { ...(current.leadForm as any), fields } };
                        });
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Obrigatório
                  </label>
                  {f.type === 'select' && (
                    <label className="grid gap-2 text-sm text-primary-800">
                      Opções (uma por linha)
                      <textarea
                        value={(f.options ?? []).join('\n')}
                        onChange={(e) => {
                          const v = e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setFormConfig((current) => {
                            const fields = [...(current.leadForm?.fields ?? [])];
                            fields[idx] = { ...fields[idx], options: v };
                            return { ...current, leadForm: { ...(current.leadForm as any), fields } };
                          });
                        }}
                        className={textareaClass('min-h-[80px] px-3 py-2')}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Fases (steps)</h3>
                <button
                  type="button"
                  onClick={() => {
                    setFormConfig((current) => ({
                      ...current,
                      leadForm: {
                        ...(current.leadForm as any),
                        steps: [...(current.leadForm?.steps ?? []), { title: `Fase ${(current.leadForm?.steps?.length ?? 0) + 1}`, fields: [] }],
                      },
                    }));
                  }}
                  className="rounded-xl border border-primary/40 px-3 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10"
                >
                  Adicionar fase
                </button>
              </div>

              {(formConfig as any).leadForm?.steps?.map((s: any, sIdx: number) => (
                <div key={sIdx} className={`${nestedCardClass} mt-3`}>
                  <div className="flex items-center justify-between text-primary-900">
                    <h4 className="text-sm font-semibold">{s.title || `Fase ${sIdx + 1}`}</h4>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (sIdx === 0) return;
                          setFormConfig((current) => {
                            const steps = [...(current.leadForm?.steps ?? [])];
                            const tmp = steps[sIdx - 1];
                            steps[sIdx - 1] = steps[sIdx];
                            steps[sIdx] = tmp;
                            return { ...current, leadForm: { ...(current.leadForm as any), steps } };
                          });
                        }}
                        className="rounded-full border border-primary/30 px-2 py-1 font-semibold text-primary-700 hover:border-primary hover:bg-primary/10"
                        aria-label="Mover fase para cima"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormConfig((current) => {
                            const steps = [...(current.leadForm?.steps ?? [])];
                            if (sIdx === steps.length - 1) return current;
                            const tmp = steps[sIdx + 1];
                            steps[sIdx + 1] = steps[sIdx];
                            steps[sIdx] = tmp;
                            return { ...current, leadForm: { ...(current.leadForm as any), steps } };
                          });
                        }}
                        className="rounded-full border border-primary/30 px-2 py-1 font-semibold text-primary-700 hover:border-primary hover:bg-primary/10"
                        aria-label="Mover fase para baixo"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormConfig((current) => ({
                            ...current,
                            leadForm: {
                              ...(current.leadForm as any),
                              steps: (current.leadForm?.steps ?? []).filter((_: any, i: number) => i !== sIdx),
                            },
                          }));
                        }}
                        className="rounded-full border border-rose-200 px-2 py-1 font-semibold text-rose-500 hover:border-rose-400 hover:bg-rose-50"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <label className="grid gap-2 text-sm text-primary-800">
                    Título da fase
                    <input
                      value={s.title ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormConfig((current) => {
                          const steps = [...(current.leadForm?.steps ?? [])];
                          steps[sIdx] = { ...steps[sIdx], title: v };
                          return { ...current, leadForm: { ...(current.leadForm as any), steps } };
                        });
                      }}
                      className={`${inputClass} px-3 py-2`}
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-primary-800">
                    Campos desta fase (marque os campos que pertencem a esta fase)
                    <div className="grid gap-1">
                      {((formConfig as any).leadForm?.fields ?? []).map((ff: any) => (
                        <label key={ff.name} className="inline-flex items-center gap-2 text-sm text-primary-800">
                          <input
                            type="checkbox"
                            checked={(s.fields ?? []).includes(ff.name)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormConfig((current) => {
                                const steps = [...(current.leadForm?.steps ?? [])];
                                const fields = new Set(steps[sIdx]?.fields ?? []);
                                if (checked) fields.add(ff.name);
                                else fields.delete(ff.name);
                                steps[sIdx] = { ...steps[sIdx], fields: Array.from(fields) };
                                return { ...current, leadForm: { ...(current.leadForm as any), steps } };
                              });
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          {ff.label} ({ff.name})
                        </label>
                      ))}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Hero e chamada principal</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-primary-800">
              Texto do selo
              <input
                value={formConfig.hero.badgeText}
                onChange={(event) => handleConfigChange('hero', 'badgeText', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              Título principal
              <input
                value={formConfig.hero.title}
                onChange={(event) => handleConfigChange('hero', 'title', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              Descrição
              <textarea
                value={formConfig.hero.description}
                onChange={(event) => handleConfigChange('hero', 'description', event.target.value)}
                className={textareaClass("min-h-[120px]")}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              Lista de benefícios (um por linha)
              <textarea
                value={formConfig.hero.bullets.join('\n')}
                onChange={(event) => handleHeroBulletsChange(event.target.value)}
                className={textareaClass("min-h-[120px]")}
              />
            </label>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Públicos atendidos (accordion)</h2>
              <p className="text-sm text-primary-700">
                Gerencie os segmentos exibidos no accordion da página inicial.
              </p>
            </div>
            <button type="button" onClick={handleAddAudienceItem} className={pillButtonClass}>
              Adicionar público
            </button>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-primary-800">
              Título da seção
              <input
                value={formConfig.audiences.title}
                onChange={(event) => handleAudiencesChange('title', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Descrição
              <textarea
                value={formConfig.audiences.description}
                onChange={(event) => handleAudiencesChange('description', event.target.value)}
                className={textareaClass('min-h-[100px]')}
              />
            </label>
            {formConfig.audiences.items.map((item, index) => (
              <div key={`${item.title}-${index}`} className={nestedCardClass}>
                <div className="flex items-center justify-between text-primary-900">
                  <h3 className="text-base font-semibold">Público #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveAudienceItem(index)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
                  >
                    Remover
                  </button>
                </div>
                <label className="grid gap-2 text-sm text-primary-800">
                  Título
                  <input
                    value={item.title}
                    onChange={(event) => handleAudienceItemChange(index, 'title', event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm text-primary-800">
                  Descrição
                  <textarea
                    value={item.description}
                    onChange={(event) => handleAudienceItemChange(index, 'description', event.target.value)}
                    className={textareaClass('min-h-[100px]')}
                  />
                </label>
                <label className="grid gap-2 text-sm text-primary-800">
                  Destaques (um por linha)
                  <textarea
                    value={item.highlights.join('\n')}
                    onChange={(event) => handleAudienceHighlightsChange(index, event.target.value)}
                    className={textareaClass('min-h-[100px]')}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Configurações da calculadora</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-primary-800">
              Valor mínimo (R$)
              <input
                type="number"
                min={0}
                value={formConfig.calculator.minAmount}
                onChange={(event) => handleConfigChange('calculator', 'minAmount', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Valor máximo (R$)
              <input
                type="number"
                min={formConfig.calculator.minAmount}
                value={formConfig.calculator.maxAmount}
                onChange={(event) => handleConfigChange('calculator', 'maxAmount', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Passo do controle (R$)
              <input
                type="number"
                min={100}
                value={formConfig.calculator.step}
                onChange={(event) => handleConfigChange('calculator', 'step', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Valor padrão (R$)
              <input
                type="number"
                min={formConfig.calculator.minAmount}
                value={formConfig.calculator.defaultAmount}
                onChange={(event) => handleConfigChange('calculator', 'defaultAmount', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Parcelas padrão
              <input
                type="number"
                min={1}
                value={formConfig.calculator.defaultInstallments}
                onChange={(event) => handleConfigChange('calculator', 'defaultInstallments', Number(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Opções de parcelas (separadas por vírgula)
              <input
                value={formConfig.calculator.installmentOptions.join(', ')}
                onChange={(event) => handleInstallmentOptionsChange(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Taxa de juros mensal (%)
              <input
                type="number"
                step="0.01"
                value={interestRateField}
                onChange={(event) => handleInterestRateChange(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Modo padrão da calculadora
              <select
                value={formConfig.calculator.defaultMode}
                onChange={(event) => handleConfigChange('calculator', 'defaultMode', event.target.value as CalculatorMode)}
                className={inputClass}
              >
                {modeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bloco de vantagens</h2>
            <button
              type="button"
              onClick={handleAddAdvantage}
              className={pillButtonClass}
            >
              Adicionar vantagem
            </button>
          </div>
          <div className="grid gap-6">
            {formConfig.advantages.items.map((item, index) => (
              <div key={index} className={nestedCardClass}>
                <div className="flex items-center justify-between text-primary-900">
                  <h3 className="text-base font-semibold">Vantagem #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdvantage(index)}
                    className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                  >
                    Remover
                  </button>
                </div>
                <label className="grid gap-2 text-sm text-primary-800">
                  Ícone
                  <select
                    value={item.icon}
                    onChange={(event) => handleAdvantageChange(index, 'icon', event.target.value)}
                    className={inputClass}
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-primary-800">
                  Título
                  <input
                    value={item.title}
                    onChange={(event) => handleAdvantageChange(index, 'title', event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm text-primary-800">
                  Descrição
                  <textarea
                    value={item.description}
                    onChange={(event) => handleAdvantageChange(index, 'description', event.target.value)}
                    className={textareaClass("min-h-[80px]")}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Passo a passo</h2>
            <button
              type="button"
              onClick={handleAddHowToApplyStep}
              className="rounded-xl border border-primary/40 px-3 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10"
            >
              Adicionar passo
            </button>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-primary-800">
              Título da seção
              <input
                value={formConfig.howToApply.title}
                onChange={(event) => handleConfigChange('howToApply', 'title', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Descrição
              <textarea
                value={formConfig.howToApply.description}
                onChange={(event) => handleConfigChange('howToApply', 'description', event.target.value)}
                className={textareaClass("min-h-[100px]")}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-primary-800">
                Texto do link
                <input
                  value={formConfig.howToApply.ctaLabel}
                  onChange={(event) => handleConfigChange('howToApply', 'ctaLabel', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-sm text-primary-800">
                URL do link
                <input
                  value={formConfig.howToApply.ctaLink}
                  onChange={(event) => handleConfigChange('howToApply', 'ctaLink', event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            {formConfig.howToApply.steps.map((step, index) => (
              <div key={index} className={nestedCardClass}>
                <div className="flex items-center justify-between text-primary-900">
                  <h3 className="text-base font-semibold">Passo #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveHowToApplyStep(index)}
                    className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                  >
                    Remover
                  </button>
                </div>
                <label className="grid gap-2 text-sm text-primary-800">
                  Título
                  <input
                    value={step.title}
                    onChange={(event) => handleHowToApplyStepsChange(index, 'title', event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm text-primary-800">
                  Descrição
                  <textarea
                    value={step.description}
                    onChange={(event) => handleHowToApplyStepsChange(index, 'description', event.target.value)}
                    className={textareaClass("min-h-[80px]")}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
            <button type="button" onClick={handleAddFAQItem} className={pillButtonClass}>
              Adicionar pergunta
            </button>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-primary-800">
              Título da seção
              <input
                value={formConfig.faq.title}
                onChange={(event) => handleConfigChange('faq', 'title', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Descrição
              <textarea
                value={formConfig.faq.description}
                onChange={(event) => handleConfigChange('faq', 'description', event.target.value)}
                className={textareaClass("min-h-[100px]")}
              />
            </label>
            {formConfig.faq.items.map((item, index) => (
              <div key={index} className={nestedCardClass}>
                <div className="flex items-center justify-between text-primary-900">
                  <h3 className="text-base font-semibold">Pergunta #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveFAQItem(index)}
                    className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                  >
                    Remover
                  </button>
                </div>
                <label className="grid gap-2 text-sm text-primary-800">
                  Pergunta
                  <input
                    value={item.question}
                    onChange={(event) => handleFAQChange(index, 'question', event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm text-primary-800">
                  Resposta
                  <textarea
                    value={item.answer}
                    onChange={(event) => handleFAQChange(index, 'answer', event.target.value)}
                    className={textareaClass("min-h-[100px]")}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Rodapé</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-primary-800">
              Título institucional
              <input
                value={formConfig.footer.title}
                onChange={(event) => handleConfigChange('footer', 'title', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Registro / CNPJ
              <input
                value={formConfig.footer.registration}
                onChange={(event) => handleConfigChange('footer', 'registration', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Endereço
              <input
                value={formConfig.footer.address}
                onChange={(event) => handleConfigChange('footer', 'address', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Horário de atendimento
              <input
                value={formConfig.footer.schedule}
                onChange={(event) => handleConfigChange('footer', 'schedule', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              Contatos
              <input
                value={formConfig.footer.contact}
                onChange={(event) => handleConfigChange('footer', 'contact', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              URL do logo do rodapé (opcional)
              <input
                value={(formConfig.footer as any).footerLogoUrl ?? ''}
                onChange={(event) => handleConfigChange('footer', 'footerLogoUrl' as any, event.target.value as any)}
                placeholder="https://exemplo.com/logo-rodape.png"
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              Whatsapp de atendimento (ex: +5511912345678 ou 11912345678)
              <input
                value={(formConfig.footer as any).whatsapp ?? ''}
                onChange={(event) => handleConfigChange('footer', 'whatsapp' as any, event.target.value as any)}
                placeholder="+5511912345678"
                className={inputClass}
              />
              <p className="text-xs text-primary-600">
                Formatos aceitos: com ou sem +55. O frontend normaliza para o formato usado pelo WhatsApp (wa.me).
              </p>
              {!isWhatsappValid((formConfig.footer as any).whatsapp) && (
                <p className="text-xs text-rose-400">Número inválido ou mal formatado — o botão de envio ficará desabilitado.</p>
              )}
            </label>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Página "Nossa empresa"</h2>
              <p className="text-sm text-primary-700">
                Ative ou edite as informações institucionais exibidas na página dedicada.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-primary-800">
              <input
                type="checkbox"
                checked={formConfig.company.enabled}
                onChange={(event) => handleConfigChange('company', 'enabled', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              Página ativa
            </label>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-primary-800">
              Título principal
              <input
                value={formConfig.company.heroTitle}
                onChange={(event) => handleConfigChange('company', 'heroTitle', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Subtítulo
              <textarea
                value={formConfig.company.heroSubtitle}
                onChange={(event) => handleConfigChange('company', 'heroSubtitle', event.target.value)}
                className={textareaClass("min-h-[100px]")}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Missão
              <textarea
                value={formConfig.company.mission}
                onChange={(event) => handleConfigChange('company', 'mission', event.target.value)}
                className={textareaClass("min-h-[100px]")}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Visão
              <textarea
                value={formConfig.company.vision}
                onChange={(event) => handleConfigChange('company', 'vision', event.target.value)}
                className={textareaClass("min-h-[100px]")}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              História / Quem somos
              <textarea
                value={formConfig.company.history}
                onChange={(event) => handleConfigChange('company', 'history', event.target.value)}
                className={textareaClass("min-h-[120px]")}
              />
            </label>
            <label className="grid gap-2 text-sm text-primary-800">
              Valores (um por linha)
              <textarea
                value={formConfig.company.values.join('\n')}
                onChange={(event) => handleCompanyValuesChange(event.target.value)}
                className={textareaClass("min-h-[120px]")}
              />
            </label>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-xl font-semibold">Senha do administrador</h2>
          <form className="grid gap-4 md:grid-cols-[2fr_1fr]" onSubmit={handlePasswordChange}>
            <label className="grid gap-2 text-sm text-primary-800 md:col-span-2">
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Defina uma nova senha segura"
                className={inputClass}
                disabled={isUpdatingPassword}
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Salvando…' : 'Atualizar senha'}
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm shadow-primary/10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-sm text-primary-700">
            <p>Revise as alterações antes de salvar para que o site seja atualizado imediatamente.</p>
            <p>Use o botão de restaurar para voltar ao conteúdo padrão original.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={handleResetConfig}
              className="rounded-xl border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
            >
              Restaurar padrão
            </button>
            <button
              type="button"
              onClick={handleSubmitConfig}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              Salvar alterações
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-primary-50/70 p-6 text-sm text-primary-800 shadow-sm">
          <p>
            Dica: utilize o botão “Restaurar padrão” se desejar voltar às configurações originais fornecidas pela Consignado 99.
            As alterações são persistidas localmente neste navegador.
          </p>
        </section>
      </main>

      {/* Floating save button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleSubmitConfig}
          disabled={!isDirty || isSaving}
          title={isDirty ? 'Salvar alterações' : 'Sem alterações para salvar'}
          className={`flex items-center justify-center space-x-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isDirty ? 'bg-primary text-white hover:bg-primary-600' : 'bg-primary-100 text-primary-700'
          }`}
        >
          {isSaving ? (
            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
            </svg>
          ) : null}
          <span>{isSaving ? 'Salvando…' : isDirty ? 'Salvar alterações' : 'Salvo'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPage;

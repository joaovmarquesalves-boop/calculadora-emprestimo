import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { formatCurrency } from '../utils/loan';
import { CalculatorMode } from '../context/SiteConfigContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { isValidCPF } from '../utils/validators';

type LeadFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loanAmount: number;
  installments: number;
  monthlyPayment: number;
  mode: CalculatorMode;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const LeadFormModal = ({ isOpen, onClose, loanAmount, installments, monthlyPayment, mode }: LeadFormModalProps) => {
  const { config } = useSiteConfig();

  // Obtém o número configurado pelo admin (pode vir com +55, 55 ou somente os dígitos locais)
  const adminWhatsappRaw = config?.footer?.whatsapp ?? '';

  const buildWhatsappDigits = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    // Se já tem código do país (55) e comprimento correto (12 ou 13), mantém
    if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
      return digits;
    }

    // Se recebeu apenas DDD + número (10 ou 11), prefixa 55
    if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) {
      return `55${digits}`;
    }

    // Caso já venha com 12/13 sem 55 (provavelmente inválido), tenta prefixar
    if (digits.length === 12 || digits.length === 13) {
      // assume que falta o 55 no início
      return `55${digits}`;
    }

    return null; // inválido
  };

  const whatsappDigits = buildWhatsappDigits(adminWhatsappRaw);

  const [showCpf, setShowCpf] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  // Quando o usuário navega manualmente (Back/Next) queremos suprimir o
  // auto-advance por um curto período para evitar que a aba "salte" de
  // volta para frente imediatamente (má UX). Usamos um ref para não
  // reiniciar renders.
  const suppressAutoAdvanceRef = useRef(false);
  const suppressTimerRef = useRef<number | null>(null);

  const stepsConfig = config?.leadForm?.steps && config.leadForm.steps.length > 0
    ? config.leadForm.steps
    : [{ title: undefined, fields: (config?.leadForm?.fields ?? []).map((f: any) => f.name) }];

  const fieldsByName: Record<string, any> = {};
  (config?.leadForm?.fields ?? []).forEach((f: any) => { fieldsByName[f.name] = f; });

  const fieldsInCurrentStep = (stepsConfig[currentStep]?.fields ?? []).map((n: string) => fieldsByName[n]).filter(Boolean);

  const validateField = (type: string, value: string) => {
    const v = (value || '').toString().trim();
    if (type === 'text') return v.length > 0;
    if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (type === 'tel') {
      const d = v.replace(/\D/g, '');
      return d.length >= 10; // DDD + number
    }
    if (type === 'cpf') {
      // Usa algoritmo de dígitos verificadores para validar CPF
      return isValidCPF(v);
    }
    if (type === 'select') return v.length > 0;
    return v.length > 0;
  };

  const isStepValid = (stepIndex: number) => {
    const fields = (stepsConfig[stepIndex]?.fields ?? []).map((n: string) => fieldsByName[n]).filter(Boolean);
    return fields.every((f: any) => {
      const val = (formValues[f.name] ?? '').toString();

      // Campos obrigatórios devem passar na validação
      if (f.required) return validateField(f.type, val);

      // Para CPF: se foi preenchido (mesmo não sendo obrigatório), exige validade
      if (f.type === 'cpf' && val.replace(/\D/g, '').length > 0) {
        return validateField('cpf', val);
      }

      // Para outros campos não obrigatórios, considera válido por padrão
      return true;
    });
  };

  // Auto-advance when current step becomes valid
  useEffect(() => {
    let t: any = null;
    // Não auto-avançar se o usuário navegou manualmente há pouco tempo.
    if (!suppressAutoAdvanceRef.current && isStepValid(currentStep) && currentStep < stepsConfig.length - 1) {
      t = setTimeout(() => setCurrentStep((s) => s + 1), 250);
    }
    return () => { if (t) clearTimeout(t); };
  }, [formValues, currentStep]);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setFormValues({});
      setShowCpf(false);
    }
  }, [isOpen]);

  const formattedAmount = useMemo(() => formatCurrency(loanAmount), [loanAmount]);
  const formattedMonthly = useMemo(() => formatCurrency(monthlyPayment), [monthlyPayment]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Build sanitized values
    const sanitizedValues: Record<string, string> = {};
    Object.keys(formValues).forEach((k) => (sanitizedValues[k] = (formValues[k] || '').replace(/\D/g, '')));

    if (!whatsappDigits) {
      // número não configurado ou inválido
      alert('Número de WhatsApp do atendimento não configurado pelo administrador.');
      return;
    }

    // Monta a mensagem com os dados preenchidos e os valores da simulação
    const base = `Olá! Gostaria de uma simulação de empréstimo. Valor liberado: ${formattedAmount}, Parcelas: ${installments}x, Parcela ${
      mode === 'installment' ? 'estimada' : 'selecionada'
    }: ${formattedMonthly}.`;

    const parts: string[] = [base];
    const fields = config?.leadForm?.fields ?? [];
    fields.forEach((f) => {
      const raw = formValues[f.name] ?? '';
      if (!raw) return;
      if (f.type === 'cpf') {
        parts.push(`${f.label}: ${raw.replace(/\D/g, '')}`);
      } else {
        parts.push(`${f.label}: ${raw}`);
      }
    });

    const messageWithFields = parts.join(' ');

    const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(messageWithFields)}`;

    // Abre o link oficial do WhatsApp com a mensagem pré-formatada. Esse comportamento substitui o submit tradicional.
    window.open(whatsappUrl, '_blank');

    // close modal if there's a phone field with reasonable length or no phone field
    const phoneField = (config?.leadForm?.fields ?? []).find((f) => f.type === 'tel');
    if (!phoneField) {
      onClose();
      return;
    }
    const p = sanitizedValues[phoneField.name] ?? '';
    if (p.length >= 10) onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/80 px-4 py-10 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-primary-100 bg-white p-6 shadow-highlight">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-primary-900">Receba sua simulação personalizada</h3>
            <p className="mt-2 text-sm text-primary-800">
              Informe seus dados que nossa equipe especializada enviará todos os detalhes pelo WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-primary-200 p-2 text-primary-700 transition hover:text-primary-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>
        <div className="mb-6 grid gap-3 rounded-2xl bg-primary-50 p-4 text-sm text-primary-800">
          <div className="flex items-center justify-between">
            <span>Valor liberado</span>
            <span className="font-semibold text-primary-900">{formattedAmount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Parcelamento</span>
            <span className="font-semibold text-primary-900">{installments}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{mode === 'installment' ? 'Parcela estimada' : 'Parcela selecionada'}</span>
            <span className="font-semibold text-secondary-600">{formattedMonthly}</span>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-primary-700">{stepsConfig[currentStep]?.title ?? `Fase ${currentStep + 1}`}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-primary-600">Passo {currentStep + 1} de {stepsConfig.length}</div>
              <div className="flex items-center gap-1">
                {stepsConfig.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${i === currentStep ? 'bg-secondary-500' : 'bg-primary-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fields for current step */}
          {fieldsInCurrentStep.map((f: any) => (
            <label key={f.name} className="grid gap-2 text-sm text-primary-900">
              <div className="flex items-center justify-between">
                <span>{f.label}</span>
                {f.type === 'cpf' && (
                  <button type="button" onClick={() => setShowCpf((s) => !s)} className="text-xs text-primary-500 underline">
                    {showCpf ? 'Ocultar CPF' : 'CPF'}
                  </button>
                )}
              </div>
              {f.type === 'select' ? (
                <select required={!!f.required} value={formValues[f.name] ?? ''} onChange={(e) => {
                    // limpar supressão para permitir auto-advance após alteração
                    suppressAutoAdvanceRef.current = false;
                    if (suppressTimerRef.current) { window.clearTimeout(suppressTimerRef.current); suppressTimerRef.current = null; }
                    setFormValues((s) => ({ ...s, [f.name]: e.target.value }));
                  }} className="appearance-none rounded-2xl border border-primary-200 bg-white px-4 py-3 text-base text-primary-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  <option value="" disabled>Selecione uma opção</option>
                  {(f.options ?? []).map((opt: any) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <>
                <input required={!!f.required} maxLength={f.type === 'cpf' ? 14 : undefined} inputMode={f.type === 'tel' || f.type === 'cpf' ? 'numeric' : undefined} type={f.type === 'email' ? 'email' : 'text'} value={formValues[f.name] ?? ''} onChange={(e) => {
                  let v = e.target.value;
                  if (f.type === 'tel') v = formatPhone(v);
                  if (f.type === 'cpf') v = formatCPF(v);
                  // Se o usuário estiver digitando, permita que o auto-advance
                  // volte a funcionar (limpa supressão criada por navegação manual).
                  suppressAutoAdvanceRef.current = false;
                  if (suppressTimerRef.current) {
                    window.clearTimeout(suppressTimerRef.current);
                    suppressTimerRef.current = null;
                  }
                  setFormValues((s) => ({ ...s, [f.name]: v }));
                }} placeholder={f.type === 'tel' ? '(11) 91234-5678' : undefined} className="rounded-2xl border border-primary-200 bg-white px-4 py-3 text-base text-primary-800 placeholder:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white" />
                {/* Mensagem de erro inline para CPF inválido */}
                {f.type === 'cpf' && (formValues[f.name] ?? '').toString().replace(/\D/g, '').length > 0 && !isValidCPF(formValues[f.name] ?? '') && (
                  <p className="mt-1 text-xs text-rose-400">CPF inválido.</p>
                )}
                </>
              )}
            </label>
          ))}

          <div className="flex items-center justify-between">
            <div>
              {!whatsappDigits && (
                <p className="mb-2 text-xs text-rose-400">Número de WhatsApp não configurado ou inválido. Contate o administrador.</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  // Suprime o auto-advance por um curto período para evitar que
                  // a etapa volte a avançar imediatamente após o clique do usuário.
                  suppressAutoAdvanceRef.current = true;
                  if (suppressTimerRef.current) window.clearTimeout(suppressTimerRef.current);
                  // libera supressão em 700ms ou quando o usuário digitar (ver onChange)
                  // usamos cast para compatibilidade com window.clearTimeout em TS
                  // @ts-ignore
                  suppressTimerRef.current = window.setTimeout(() => { suppressAutoAdvanceRef.current = false; suppressTimerRef.current = null; }, 700);
                  setCurrentStep((s) => Math.max(0, s - 1));
                }}
                disabled={currentStep === 0}
                className="rounded-2xl border border-primary-200 px-4 py-2 text-sm text-primary-800 disabled:opacity-50"
              >
                Voltar
              </button>
              {currentStep < stepsConfig.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isStepValid(currentStep)) return;
                    // Navegação manual também suprime o auto-advance momentaneamente
                    suppressAutoAdvanceRef.current = true;
                    if (suppressTimerRef.current) window.clearTimeout(suppressTimerRef.current);
                    // @ts-ignore
                    suppressTimerRef.current = window.setTimeout(() => { suppressAutoAdvanceRef.current = false; suppressTimerRef.current = null; }, 700);
                    setCurrentStep((s) => s + 1);
                  }}
                  disabled={!isStepValid(currentStep)}
                  className="rounded-2xl bg-secondary-500 px-4 py-2 text-sm font-semibold text-primary-900 disabled:opacity-50"
                >
                  Próximo
                </button>
              ) : (
                <button type="submit" disabled={!whatsappDigits || !isStepValid(currentStep)} className={`rounded-2xl inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold transition ${whatsappDigits && isStepValid(currentStep) ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-primary-900 hover:from-secondary-600 hover:to-secondary-500' : 'bg-primary-700/30 text-primary-200 cursor-not-allowed'}`}>{config?.leadForm?.buttonLabel ?? 'Receber Simulação no WhatsApp'}</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;

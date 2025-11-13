import { useEffect, useMemo, useState } from 'react';
import {
  calculateLoanAmountFromInstallment,
  calculateMonthlyPayment,
  formatCurrency,
} from '../utils/loan';
import { CalculatorMode, useSiteConfig } from '../context/SiteConfigContext';

type LoanCalculatorProps = {
  onSimulate: (args: {
    amount: number;
    installments: number;
    monthlyPayment: number;
    mode: CalculatorMode;
  }) => void;
};

const LoanCalculator = ({ onSimulate }: LoanCalculatorProps) => {
  const {
    config: { calculator },
  } = useSiteConfig();

  const { config } = useSiteConfig();
  const loanTypes = config.loanTypes ?? [];
  const [mode, setMode] = useState<CalculatorMode>(calculator.defaultMode);
  const [amount, setAmount] = useState(calculator.defaultAmount);
  const [installments, setInstallments] = useState(calculator.defaultInstallments);
  const [desiredInstallment, setDesiredInstallment] = useState(() =>
    calculateMonthlyPayment(calculator.defaultAmount, calculator.defaultInstallments, calculator.interestRate),
  );

  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState<string | null>(() => {
    const first = (loanTypes || []).slice().sort((a, b) => (Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER) - (Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER)).find((l) => l.active !== false);
    return first ? first.id : null;
  });

  const selectedLoanType = useMemo(() => loanTypes.find((l) => l.id === selectedLoanTypeId) ?? null, [loanTypes, selectedLoanTypeId]);
  const usedInterestRate = selectedLoanType?.interestRate ?? calculator.interestRate;

  // Update selectedLoanTypeId when loanTypes list changes (e.g., admin edits order or active flags)
  useEffect(() => {
    const first = (loanTypes || []).slice().sort((a, b) => (Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER) - (Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER)).find((l) => l.active !== false);
    if (!first) {
      setSelectedLoanTypeId(null);
      return;
    }
    // if current selection no longer exists or is inactive, switch
    const currentExistsAndActive = !!loanTypes.find((l) => l.id === selectedLoanTypeId && l.active !== false);
    if (!currentExistsAndActive) {
      setSelectedLoanTypeId(first.id);
    }
  }, [loanTypes, selectedLoanTypeId]);

  const installmentOptions = useMemo(() => {
    const unique = [...new Set(calculator.installmentOptions)]
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);
    if (unique.length === 0) {
      const fallback = calculator.defaultInstallments || 12;
      return [fallback];
    }
    return unique;
  }, [calculator.defaultInstallments, calculator.installmentOptions]);

  useEffect(() => {
    setMode(calculator.defaultMode);
  }, [calculator.defaultMode]);

  useEffect(() => {
    setAmount(() => {
      const initial = Math.min(
        Math.max(calculator.defaultAmount, calculator.minAmount),
        calculator.maxAmount,
      );
      return Number.isFinite(initial) ? initial : calculator.minAmount;
    });
  }, [calculator.defaultAmount, calculator.minAmount, calculator.maxAmount]);

  useEffect(() => {
    const fallbackInstallments = installmentOptions.includes(calculator.defaultInstallments)
      ? calculator.defaultInstallments
      : installmentOptions[0];
    setInstallments(fallbackInstallments);
  }, [calculator.defaultInstallments, installmentOptions]);

  const multiplier = useMemo(
    () => ((1 + usedInterestRate * installments) / installments) || 1,
    [usedInterestRate, installments],
  );

  const minInstallment = useMemo(
    () => calculator.minAmount * multiplier,
    [calculator.minAmount, multiplier],
  );

  const maxInstallment = useMemo(
    () => calculator.maxAmount * multiplier,
    [calculator.maxAmount, multiplier],
  );

  const installmentStep = useMemo(() => {
    const calculated = calculator.step * multiplier;
    return Math.max(1, Math.round(calculated));
  }, [calculator.step, multiplier]);

  useEffect(() => {
    setDesiredInstallment((current) => {
      const clamped = Math.min(Math.max(current, minInstallment), maxInstallment);
      return Number.isFinite(clamped) ? clamped : minInstallment;
    });
  }, [minInstallment, maxInstallment]);

  useEffect(() => {
    if (mode === 'installment') {
      setDesiredInstallment(
        calculateMonthlyPayment(amount, installments, usedInterestRate),
      );
    }
  }, [amount, installments, usedInterestRate, mode]);

  const currentAmount = useMemo(() => {
    if (mode === 'installment') {
      return amount;
    }
    const calculated = calculateLoanAmountFromInstallment(
      desiredInstallment,
      installments,
      calculator.interestRate,
    );
    const clamped = Math.min(Math.max(calculated, calculator.minAmount), calculator.maxAmount);
    return clamped;
  }, [amount, calculator.interestRate, calculator.maxAmount, calculator.minAmount, desiredInstallment, installments, mode]);

  const currentMonthlyPayment = useMemo(() => {
    if (mode === 'installment') {
      return calculateMonthlyPayment(currentAmount, installments, usedInterestRate);
    }
    return desiredInstallment;
  }, [usedInterestRate, currentAmount, desiredInstallment, installments, mode]);

  const formattedAmount = useMemo(() => formatCurrency(currentAmount), [currentAmount]);
  const formattedMonthlyPayment = useMemo(
    () => formatCurrency(currentMonthlyPayment),
    [currentMonthlyPayment],
  );

  const minAmountLabel = useMemo(() => formatCurrency(calculator.minAmount), [calculator.minAmount]);
  const maxAmountLabel = useMemo(() => formatCurrency(calculator.maxAmount), [calculator.maxAmount]);
  const minInstallmentLabel = useMemo(() => formatCurrency(minInstallment), [minInstallment]);
  const maxInstallmentLabel = useMemo(() => formatCurrency(maxInstallment), [maxInstallment]);

  const handleSimulateClick = () => {
    onSimulate({
      amount: currentAmount,
      installments,
      monthlyPayment: currentMonthlyPayment,
      mode,
    });
  };

  const handleModeChange = (nextMode: CalculatorMode) => {
    setMode(nextMode);
  };

  return (
    <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-highlight">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold text-primary-900">Calculadora inteligente</h2>
        <p className="text-sm text-primary-800">
          Ajuste o valor e a quantidade de parcelas para ver uma estimativa instantânea. Juros
          projetados a partir de {(calculator.interestRate * 100).toFixed(2)}% ao mês.
        </p>

        {/* Botões de tipos de empréstimo acima da calculadora */}
        <div className="mt-3 flex flex-wrap gap-2">
          {loanTypes
            .filter((l) => l.active !== false)
            .slice()
            .sort((a, b) => (Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER) - (Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER))
            .map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedLoanTypeId(type.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-shadow border ${
                  selectedLoanTypeId === type.id
                    ? 'bg-primary-700 text-white shadow-highlight border-primary-700'
                    : 'bg-white text-primary-800 border-primary-200 hover:bg-primary-50'
                }`}
                title={`${type.label} — ${(type.interestRate * 100).toFixed(2)}% a.m.`}
              >
                <span className="mr-2">{type.label}</span>
                <span className="text-xs font-normal">{(type.interestRate * 100).toFixed(2)}%</span>
              </button>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-primary-100/60 p-1 text-sm font-semibold text-primary-700">
          <button
            type="button"
            onClick={() => handleModeChange('installment')}
            className={`rounded-xl px-4 py-2 transition ${
              mode === 'installment'
                ? 'bg-primary-700 text-white shadow-highlight'
                : 'text-primary-700 hover:bg-primary-200/70'
            }`}
          >
            Calcular parcela
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('released')}
            className={`rounded-xl px-4 py-2 transition ${
              mode === 'released'
                ? 'bg-primary-700 text-white shadow-highlight'
                : 'text-primary-700 hover:bg-primary-200/70'
            }`}
          >
            Calcular valor liberado
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-primary-700">
            <span>
              {mode === 'installment' ? 'Valor desejado' : 'Parcela desejada'}
            </span>
            <span className="text-base font-semibold text-primary-900">
              {mode === 'installment' ? formattedAmount : formattedMonthlyPayment}
            </span>
          </div>
          <input
            className="w-full accent-primary"
            type="range"
            min={mode === 'installment' ? calculator.minAmount : minInstallment}
            max={mode === 'installment' ? calculator.maxAmount : maxInstallment}
            step={mode === 'installment' ? calculator.step : installmentStep}
            value={mode === 'installment' ? currentAmount : currentMonthlyPayment}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (mode === 'installment') {
                setAmount(value);
              } else {
                setDesiredInstallment(value);
              }
            }}
          />
          <div className="flex justify-between text-xs text-primary-600">
            <span>{mode === 'installment' ? minAmountLabel : minInstallmentLabel}</span>
            <span>{mode === 'installment' ? maxAmountLabel : maxInstallmentLabel}</span>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-primary-800">Número de parcelas</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {installmentOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setInstallments(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  installments === option
                    ? 'border-primary-600 bg-primary-700 text-white shadow-highlight'
                    : 'border-primary-200 bg-white text-primary-800 hover:border-primary-400 hover:bg-primary-100'
                }`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 p-4 text-center">
          <span className="block text-sm font-medium text-primary-700">
            {mode === 'installment' ? 'Parcela aproximada' : 'Valor liberado estimado'}
          </span>
          <span className="text-3xl font-bold text-primary-900">
            {mode === 'installment' ? formattedMonthlyPayment : formattedAmount}
          </span>
          <span className="block text-xs text-primary-700">
            Valor sujeito à análise de crédito. Simulação sem compromisso.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSimulateClick}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4 text-lg font-semibold text-white shadow-highlight transition-transform duration-200 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Simular meu Empréstimo
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
};

export default LoanCalculator;

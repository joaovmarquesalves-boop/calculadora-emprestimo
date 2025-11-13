export const DEFAULT_INTEREST_RATE = 0.017; // 1,7% ao mês

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

export const calculateMonthlyPayment = (
  amount: number,
  installments: number,
  interestRate: number = DEFAULT_INTEREST_RATE,
): number => {
  // Fórmula simplificada: aplica juros simples sobre o valor total e divide pelo número de parcelas
  const totalWithInterest = amount * (1 + interestRate * installments);
  return totalWithInterest / installments;
};

export const calculateLoanAmountFromInstallment = (
  installmentValue: number,
  installments: number,
  interestRate: number = DEFAULT_INTEREST_RATE,
): number => {
  const factor = 1 + interestRate * installments;
  return (installmentValue * installments) / factor;
};

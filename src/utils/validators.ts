// Validações de documentos e outros helpers simples

export const isValidCPF = (raw: string | undefined | null): boolean => {
  if (!raw) return false;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length !== 11) return false;

  // Rejeita sequências óbvias como 00000000000, 11111111111, etc.
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const nums = digits.split('').map((d) => parseInt(d, 10));

  // Calcula primeiro dígito verificador (pos 9)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += nums[i] * (10 - i);
  }
  let remainder = sum % 11;
  let dv1 = 11 - remainder;
  if (dv1 >= 10) dv1 = 0;
  if (dv1 !== nums[9]) return false;

  // Calcula segundo dígito verificador (pos 10)
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += nums[i] * (11 - i);
  }
  remainder = sum % 11;
  let dv2 = 11 - remainder;
  if (dv2 >= 10) dv2 = 0;
  if (dv2 !== nums[10]) return false;

  return true;
};

export default {
  isValidCPF,
};

export const formatFCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

export const calculateCommission = (amount: number) => amount * 0.05;
export const DELIVERY_FEE = 1000;

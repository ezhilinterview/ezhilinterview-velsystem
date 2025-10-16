import { CreditCard, Smartphone, FileText, Globe, Banknote } from 'lucide-react';

export const getPaymentModeIcon = (type: number | string) => {
  const typeNum = typeof type === 'string' ? parseInt(type) : type;
  switch (typeNum) {
    case 1: return Smartphone;
    case 2: return CreditCard;
    case 3: return Banknote;
    case 4: return Globe;
    default: return CreditCard;
  }
};

export const getPaymentModeIconColor = (type: number | string) => {
  const typeNum = typeof type === 'string' ? parseInt(type) : type;
  switch (typeNum) {
    case 1: return 'bg-green-500';
    case 2: return 'bg-blue-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const getPaymentModeTypeName = (type: number | string) => {
  const typeNum = typeof type === 'string' ? parseInt(type) : type;
  switch (typeNum) {
    case 1: return 'UPI';
    case 2: return 'Debit Card';
    case 3: return 'Cheque';
    case 4: return 'Internet Banking';
    default: return 'Payment Mode';
  }
};

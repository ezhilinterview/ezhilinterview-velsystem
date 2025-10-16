import { Building2, Wallet, CreditCard, Banknote } from 'lucide-react';

export const getAccountIcon = (type: number) => {
  switch (type) {
    case 1: return Building2;
    case 2: return Wallet;
    case 3: return CreditCard;
    case 4: return Banknote;
    default: return Building2;
  }
};

export const getAccountTypeColor = (type: number) => {
  switch (type) {
    case 1: return 'bg-blue-100 text-blue-700';
    case 2: return 'bg-green-100 text-green-700';
    case 3: return 'bg-purple-100 text-purple-700';
    case 4: return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const getAccountTypeName = (type: number) => {
  switch (type) {
    case 1: return 'Bank Account';
    case 2: return 'Wallet';
    case 3: return 'Credit Card';
    case 4: return 'Cash';
    default: return 'Account';
  }
};

export const getAccountIconColor = (type: number) => {
  switch (type) {
    case 1: return 'bg-blue-500';
    case 2: return 'bg-green-500';
    case 3: return 'bg-purple-500';
    case 4: return 'bg-yellow-500';
    default: return 'bg-blue-500';
  }
};

import { Edit, Building2, Wallet, CreditCard, Banknote, Smartphone, FileText, Globe } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: number;
  linkedPaymentModes?: PaymentMode[];
}

interface PaymentMode {
  id: string;
  name: string;
  type: number;
}

interface AccountDisplayProps {
  account?: Account;
  paymentMode?: PaymentMode;
  onChangeAccount?: () => void;
  onSelectPaymentMode?: (id: string) => void;
  label: string;
  variant?: 'default' | 'from' | 'to';
  showPaymentModes?: boolean;
}

function AccountDisplay({
  account,
  paymentMode,
  onChangeAccount,
  onSelectPaymentMode,
  label,
  variant = 'default',
  showPaymentModes = true
}: AccountDisplayProps) {
  const getAccountIcon = (type: number) => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5";
    switch (type) {
      case 1: return <Building2 className={iconClass} />;
      case 2: return <Wallet className={iconClass} />;
      case 3: return <CreditCard className={iconClass} />;
      case 4: return <Banknote className={iconClass} />;
      default: return <Building2 className={iconClass} />;
    }
  };

  const getAccountTypeColor = (type: number) => {
    switch (type) {
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-purple-100 text-purple-700';
      case 4: return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAccountTypeName = (type: number) => {
    switch (type) {
      case 1: return 'Bank Account';
      case 2: return 'Wallet';
      case 3: return 'Credit Card';
      case 4: return 'Cash';
      default: return 'Account';
    }
  };

  const getPaymentModeIcon = (type: number) => {
    const iconClass = "w-3 h-3 sm:w-4 sm:h-4";
    switch (type) {
      case 1: return <CreditCard className={iconClass} />;
      case 2: return <Smartphone className={iconClass} />;
      case 3: return <FileText className={iconClass} />;
      case 4: return <Globe className={iconClass} />;
      default: return <CreditCard className={iconClass} />;
    }
  };

  const getPaymentModeTypeName = (type: number) => {
    switch (type) {
      case 1: return 'Debit Card';
      case 2: return 'UPI';
      case 3: return 'Cheque';
      case 4: return 'Internet Banking';
      default: return 'Payment Mode';
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'from': return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'to': return 'border-green-200 bg-green-50 hover:bg-green-100';
      default: return 'border-gray-200 hover:bg-gray-50';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <label className="block text-sm sm:text-base font-medium text-gray-700">
          {label}
        </label>
        {onChangeAccount && (
          <button
            type="button"
            onClick={onChangeAccount}
            className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm flex items-center"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Change
          </button>
        )}
      </div>

      {account ? (
        <div className="space-y-2 sm:space-y-3">
          <div className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg transition-colors ${getVariantColor()}`}>
            <div className={`p-1.5 sm:p-2 rounded-lg ${getAccountTypeColor(account.type)}`}>
              {getAccountIcon(account.type)}
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-900">{account.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">{getAccountTypeName(account.type)}</p>
            </div>
          </div>

          {showPaymentModes && account.linkedPaymentModes && account.linkedPaymentModes.length > 0 && (
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Payment Mode (Optional)
              </label>
              {paymentMode ? (
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                    {getPaymentModeIcon(paymentMode.type)}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{paymentMode.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{getPaymentModeTypeName(paymentMode.type)}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {account.linkedPaymentModes.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => onSelectPaymentMode?.(pm.id)}
                      className="p-2 sm:p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded bg-gray-100">
                          {getPaymentModeIcon(pm.type)}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">{pm.name}</p>
                          <p className="text-xs text-gray-500">{getPaymentModeTypeName(pm.type)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-500">
          No account selected
        </div>
      )}
    </div>
  );
}

export default AccountDisplay;

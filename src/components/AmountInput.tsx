import { Calculator as CalculatorIcon } from 'lucide-react';
import { forwardRef } from 'react';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  onOpenCalculator?: () => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, onOpenCalculator, error, label = 'Amount', required = true, placeholder = '0.00' }, ref) => {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="amount" className="block text-sm sm:text-base font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm flex items-center"
            >
              <CalculatorIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Calculator
            </button>
          )}
        </div>
        <input
          ref={ref}
          type="number"
          step="0.01"
          id="amount"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

AmountInput.displayName = 'AmountInput';

export default AmountInput;

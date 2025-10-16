import { TextareaHTMLAttributes, forwardRef } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, id, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={id}
          rows={3}
          {...props}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${props.className || ''}`}
        />
        {error && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;

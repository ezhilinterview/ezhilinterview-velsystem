import { ReactNode } from 'react';

interface FormCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

function FormCard({ children, title, className = '' }: FormCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

export default FormCard;

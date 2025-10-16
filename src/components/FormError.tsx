interface FormErrorProps {
  message?: string;
}

function FormError({ message = 'Failed to save. Please try again.' }: FormErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
      <div className="text-xs sm:text-sm text-red-600">{message}</div>
    </div>
  );
}

export default FormError;

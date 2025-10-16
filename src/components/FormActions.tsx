interface FormActionsProps {
  submitLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

function FormActions({
  submitLabel,
  cancelLabel = 'Cancel',
  onCancel,
  isSubmitting = false,
  disabled = false
}: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
      >
        {cancelLabel}
      </button>
    </div>
  );
}

export default FormActions;

import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';

export function useFormDefaults<T extends Record<string, any>>(
  isEditing: boolean,
  defaultValues: Partial<T>,
  setValue: UseFormSetValue<T>,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (!isEditing) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as any, value);
        }
      });
    }
  }, [isEditing, ...dependencies]);
}

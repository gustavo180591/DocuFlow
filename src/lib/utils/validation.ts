// Error handling
export const getErrorMessage = (err: unknown): string => {
  return err instanceof Error 
    ? err.message 
    : typeof err === 'string' 
      ? err 
      : 'Error desconocido';
};

// Form validation utilities
export const isValidCUIT = (cuit: string): boolean => {
  return /^\d{2}-\d{8}-\d$/.test(cuit);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  return value.trim() ? null : `El campo ${fieldName} es requerido`;
};

export const validateCUIT = (cuit: string): string | null => {
  if (!cuit) return 'El CUIT es requerido';
  if (!isValidCUIT(cuit)) return 'Formato de CUIT inválido (ej: 30-12345678-9)';
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null; // Email is optional
  if (!isValidEmail(email)) return 'Email inválido';
  return null;
};

// Common form interfaces
export interface FormErrors {
  [key: string]: string | null;
}

export type ValidationRule<T> = (value: unknown, formData: T) => string | null;

export interface ValidationRules<T> {
  [key: string]: ValidationRule<T>;
}

export function validateForm<T extends Record<string, unknown>>(
  formData: T,
  rules: ValidationRules<T>
): FormErrors {
  const errors: FormErrors = {};
  
  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
}

// Safe date formatting
export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

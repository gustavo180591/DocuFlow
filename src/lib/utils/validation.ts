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
export type FormErrors<T> = Partial<Record<keyof T, string>>;

type ValidationRule<T> = (value: unknown, formData: T) => string | null;
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>>>;

// Base form data types
export interface BaseInstitutionFormData {
  name: string;
  cuit: string;
  email: string;
  address: string;
}

export interface Institution {
  id: string;
  name: string;
  cuit: string;
  email: string | null;
  address: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type InstitutionFormData = Omit<BaseInstitutionFormData, 'email' | 'address'> & {
  email: string;
  address: string;
};

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institutionId: string;
}

// Form validation rules
export function createInstitutionValidator() {
  return (formData: BaseInstitutionFormData): FormErrors<BaseInstitutionFormData> => {
    const errors: FormErrors<BaseInstitutionFormData> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!formData.cuit?.trim()) {
      errors.cuit = 'El CUIT es requerido';
    } else if (!isValidCUIT(formData.cuit)) {
      errors.cuit = 'Formato de CUIT inválido (ej: 30-12345678-9)';
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    return errors;
  };
}

export function createMemberValidator() {
  return (formData: MemberFormData): FormErrors<MemberFormData> => {
    const errors: FormErrors<MemberFormData> = {};
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.institutionId) {
      errors.institutionId = 'La institución es requerida';
    }
    
    return errors;
  };
}

// Generic form validation
export function validateForm<T extends Record<string, unknown>>(
  formData: T,
  rules: ValidationRules<T>
): FormErrors<T> {
  const errors: FormErrors<T> = {};
  
  (Object.entries(rules) as [keyof T, ValidationRule<T> | undefined][]).forEach(([field, validator]) => {
    if (validator) {
      const error = validator(formData[field], formData);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
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

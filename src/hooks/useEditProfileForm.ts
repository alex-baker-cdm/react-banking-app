import { useState, useRef, useEffect, useCallback } from 'react';

export interface ProfileFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
}

export interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}

const initialFormData: ProfileFormData = {
  fullName: 'Cenk SARI',
  username: 'cenksari',
  email: 'cenk@bankingltd.com',
  phone: '+1 555 123 4567',
  dateOfBirth: '1990-01-15',
  address: '123 Main Street',
  city: 'New York',
  country: 'United States',
};

const validateForm = (formData: ProfileFormData): FormErrors => {
  const newErrors: FormErrors = {};

  if (!formData.fullName.trim()) {
    newErrors.fullName = 'Full name is required';
  }

  if (!formData.username.trim()) {
    newErrors.username = 'Username is required';
  } else if (formData.username.trim().length < 3) {
    newErrors.username = 'Username must be at least 3 characters';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  if (!formData.phone.trim()) {
    newErrors.phone = 'Phone number is required';
  }

  if (!formData.dateOfBirth) {
    newErrors.dateOfBirth = 'Date of birth is required';
  }

  if (!formData.address.trim()) {
    newErrors.address = 'Address is required';
  }

  if (!formData.city.trim()) {
    newErrors.city = 'City is required';
  }

  if (!formData.country) {
    newErrors.country = 'Country is required';
  }

  return newErrors;
};

interface UseEditProfileFormReturn {
  formData: ProfileFormData;
  errors: FormErrors;
  successMessage: string;
  isSaving: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  dismissSuccess: () => void;
}

const useEditProfileForm = (): UseEditProfileFormReturn => {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = event.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        if (prev[name as keyof FormErrors]) {
          return { ...prev, [name]: undefined };
        }
        return prev;
      });
      setSuccessMessage('');
    },
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const newErrors = validateForm(formData);
      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return;
      }

      setIsSaving(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        setSuccessMessage('Profile updated successfully!');
        saveTimeoutRef.current = null;
      }, 1000);
    },
    [formData]
  );

  const dismissSuccess = useCallback((): void => {
    setSuccessMessage('');
  }, []);

  return {
    formData,
    errors,
    successMessage,
    isSaving,
    handleChange,
    handleSubmit,
    dismissSuccess,
  };
};

export default useEditProfileForm;

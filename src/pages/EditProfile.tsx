import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Card,
  Heading,
  TextField,
  SelectField,
  Button,
  Alert,
  Divider as AmplifyDivider,
  Avatar,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

interface ProfileFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
}

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}

const countryOptions = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'India',
  'Other',
];

const EditProfile: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: 'Cenk SARI',
    username: 'cenksari',
    email: 'cenk@bankingltd.com',
    phone: '+1 555 123 4567',
    dateOfBirth: '1990-01-15',
    address: '123 Main Street',
    city: 'New York',
    country: 'United States',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setSuccessMessage('');
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage('Profile updated successfully!');
      saveTimeoutRef.current = null;
    }, 1000);
  };

  const handleCancel = (): void => {
    navigate('/profile');
  };

  return (
    <Layout>
      <Divider />

      <h1 className='title'>Edit Profile</h1>

      <form className='edit-profile-container' onSubmit={handleSubmit}>
        <Flex justifyContent='center' marginBottom='1rem'>
          <Avatar src='images/profile.jpg' alt='Profile photo' size='large' />
        </Flex>

        {successMessage && (
          <Alert variation='success' isDismissible hasIcon onDismiss={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        <Card variation='elevated' className='edit-profile-card'>
          <Heading level={4} marginBottom='1rem'>
            Personal Information
          </Heading>

          <Flex direction='column' gap='1rem'>
            <TextField
              label='Full Name'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              hasError={!!errors.fullName}
              errorMessage={errors.fullName}
              placeholder='Enter your full name'
            />

            <TextField
              label='Username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              hasError={!!errors.username}
              errorMessage={errors.username}
              placeholder='Enter your username'
              descriptiveText='This is your public display name'
            />

            <TextField
              label='Email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              hasError={!!errors.email}
              errorMessage={errors.email}
              placeholder='Enter your email'
            />

            <TextField
              label='Phone'
              name='phone'
              type='tel'
              value={formData.phone}
              onChange={handleChange}
              hasError={!!errors.phone}
              errorMessage={errors.phone}
              placeholder='Enter your phone number'
            />

            <TextField
              label='Date of Birth'
              name='dateOfBirth'
              type='date'
              value={formData.dateOfBirth}
              onChange={handleChange}
              hasError={!!errors.dateOfBirth}
              errorMessage={errors.dateOfBirth}
            />
          </Flex>
        </Card>

        <AmplifyDivider marginTop='1.5rem' marginBottom='1.5rem' />

        <Card variation='elevated' className='edit-profile-card'>
          <Heading level={4} marginBottom='1rem'>
            Address
          </Heading>

          <Flex direction='column' gap='1rem'>
            <TextField
              label='Street Address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              hasError={!!errors.address}
              errorMessage={errors.address}
              placeholder='Enter your street address'
            />

            <TextField
              label='City'
              name='city'
              value={formData.city}
              onChange={handleChange}
              hasError={!!errors.city}
              errorMessage={errors.city}
              placeholder='Enter your city'
            />

            <SelectField
              label='Country'
              name='country'
              value={formData.country}
              onChange={handleChange}
              hasError={!!errors.country}
              errorMessage={errors.country}
              options={countryOptions}
            />
          </Flex>
        </Card>

        <Flex direction='row' justifyContent='space-between' marginTop='1.5rem' gap='1rem'>
          <Button variation='link' type='button' onClick={handleCancel} isFullWidth>
            Cancel
          </Button>
          <Button
            variation='primary'
            type='submit'
            isLoading={isSaving}
            loadingText='Saving...'
            isFullWidth
          >
            Save Changes
          </Button>
        </Flex>
      </form>

      <Divider />
    </Layout>
  );
};

export default EditProfile;

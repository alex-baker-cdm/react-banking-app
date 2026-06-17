import { Card, Heading, Flex, TextField } from '@aws-amplify/ui-react';

import type { ProfileFormData, FormErrors } from '../../hooks/useEditProfileForm';

interface PersonalInfoCardProps {
  formData: ProfileFormData;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ formData, errors, onChange }) => (
  <Card variation='elevated' className='edit-profile-card'>
    <Heading level={4} marginBottom='1rem'>
      Personal Information
    </Heading>

    <Flex direction='column' gap='1rem'>
      <TextField
        label='Full Name'
        name='fullName'
        value={formData.fullName}
        onChange={onChange}
        hasError={!!errors.fullName}
        errorMessage={errors.fullName}
        placeholder='Enter your full name'
      />

      <TextField
        label='Username'
        name='username'
        value={formData.username}
        onChange={onChange}
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
        onChange={onChange}
        hasError={!!errors.email}
        errorMessage={errors.email}
        placeholder='Enter your email'
      />

      <TextField
        label='Phone'
        name='phone'
        type='tel'
        value={formData.phone}
        onChange={onChange}
        hasError={!!errors.phone}
        errorMessage={errors.phone}
        placeholder='Enter your phone number'
      />

      <TextField
        label='Date of Birth'
        name='dateOfBirth'
        type='date'
        value={formData.dateOfBirth}
        onChange={onChange}
        hasError={!!errors.dateOfBirth}
        errorMessage={errors.dateOfBirth}
      />
    </Flex>
  </Card>
);

export default PersonalInfoCard;

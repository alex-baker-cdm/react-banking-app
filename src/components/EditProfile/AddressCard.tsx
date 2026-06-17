import { Card, Heading, Flex, TextField, SelectField } from '@aws-amplify/ui-react';

import type { ProfileFormData, FormErrors } from '../../hooks/useEditProfileForm';

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

interface AddressCardProps {
  formData: ProfileFormData;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ formData, errors, onChange }) => (
  <Card variation='elevated' className='edit-profile-card'>
    <Heading level={4} marginBottom='1rem'>
      Address
    </Heading>

    <Flex direction='column' gap='1rem'>
      <TextField
        label='Street Address'
        name='address'
        value={formData.address}
        onChange={onChange}
        hasError={!!errors.address}
        errorMessage={errors.address}
        placeholder='Enter your street address'
      />

      <TextField
        label='City'
        name='city'
        value={formData.city}
        onChange={onChange}
        hasError={!!errors.city}
        errorMessage={errors.city}
        placeholder='Enter your city'
      />

      <SelectField
        label='Country'
        name='country'
        value={formData.country}
        onChange={onChange}
        hasError={!!errors.country}
        errorMessage={errors.country}
        options={countryOptions}
      />
    </Flex>
  </Card>
);

export default AddressCard;

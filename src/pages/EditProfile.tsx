import { useNavigate } from 'react-router-dom';
import { Flex, Button, Alert, Divider as AmplifyDivider, Avatar } from '@aws-amplify/ui-react';

import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import PersonalInfoCard from '../components/EditProfile/PersonalInfoCard';
import AddressCard from '../components/EditProfile/AddressCard';

import useEditProfileForm from '../hooks/useEditProfileForm';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { formData, errors, successMessage, isSaving, handleChange, handleSubmit, dismissSuccess } =
    useEditProfileForm();

  const handleCancel = (): void => {
    navigate('/profile');
  };

  return (
    <Layout>
      <Divider />

      <h1 className='title'>Edit Profile</h1>

      <form className='edit-profile-container' onSubmit={handleSubmit}>
        <Flex justifyContent='center' marginBottom='1rem'>
          <Avatar src='/images/profile.jpg' alt='Profile photo' size='large' />
        </Flex>

        {successMessage && (
          <Alert variation='success' isDismissible hasIcon onDismiss={dismissSuccess}>
            {successMessage}
          </Alert>
        )}

        <PersonalInfoCard formData={formData} errors={errors} onChange={handleChange} />

        <AmplifyDivider marginTop='1.5rem' marginBottom='1.5rem' />

        <AddressCard formData={formData} errors={errors} onChange={handleChange} />

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

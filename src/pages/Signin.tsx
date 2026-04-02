import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sentry } from '../sentry';

// components
import Input from '../components/Form/Input';
import Button from '../components/Form/Button';

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates an email address format.
   *
   * @param {string} email - The email address to validate.
   * @returns {string} Error message if invalid, empty string if valid.
   */
  const validateEmail = (email: string): string => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  /**
   * Validates a password value.
   *
   * @param {string} password - The password to validate.
   * @returns {string} Error message if invalid, empty string if valid.
   */
  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  /**
   * Handles email input change and clears the error.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  /**
   * Handles password input change and clears the error.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError('');
  };

  /**
   * Handles the form submission event by validating inputs and navigating to the home page.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) {
      setEmailError(emailValidationError);
      Sentry.captureMessage(`Email validation error: ${emailValidationError}`, {
        level: 'warning',
        extra: { email },
      });
    }

    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
    }

    if (emailValidationError || passwordValidationError) {
      return;
    }

    setIsSubmitting(true);
    navigate('/home', { replace: true });
  };

  return (
    <div className='flex flex-v-center flex-h-center h-full'>
      <div className='bg' />
      <div className='text'>
        <h1 className='text-shadow'>Hello! 👋</h1>
        <p className='text-shadow'>Please sign in to your account or sign up a new account.</p>

        <form method='post' action='/' className='form' noValidate onSubmit={handleSubmit}>
          <div className='form-line'>
            <div className='label-line'>
              <label htmlFor='email' className='text-shadow'>
                Email
              </label>
            </div>
            <Input
              required
              tabIndex={0}
              name='email'
              type='email'
              value={email}
              autoComplete='off'
              placeholder='Please enter your email'
              error={emailError}
              onChange={handleEmailChange}
            />
          </div>
          <div className='form-line'>
            <div className='label-line flex flex-h-center flex-space-between'>
              <label htmlFor='password' className='text-shadow'>
                Password
              </label>
              {/* TODO: Update to point to a dedicated forgot-password flow */}
              <Link to='/' className='text-shadow'>
                Forgot password?
              </Link>
            </div>
            <Input
              required
              tabIndex={0}
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoComplete='off'
              placeholder='Please enter your password'
              error={passwordError}
              onChange={handlePasswordChange}
              endAdornment={
                <button
                  type='button'
                  className='password-toggle'
                  tabIndex={0}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className='material-symbols-outlined'>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              }
            />
          </div>
          <div className='form-line'>
            <Button
              type='submit'
              text={isSubmitting ? 'Signing in...' : 'Sign in'}
              tabIndex={0}
              disabled={isSubmitting}
            />
          </div>
        </form>

        <div className='links'>
          {/* TODO: Update to point to a dedicated sign-up page */}
          <a href='/' className='text-shadow'>
            Click here
          </a>
          &nbsp;
          <span className='text-shadow'>if you don&apos;t have an account</span>
        </div>
      </div>
    </div>
  );
};

export default Signin;

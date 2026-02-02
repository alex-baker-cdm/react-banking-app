import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// components
import Input from '../components/Form/Input';
import Button from '../components/Form/Button';

interface FormErrors {
  email?: string;
  password?: string;
}

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (passwordValue: string): string | undefined => {
    if (!passwordValue) {
      return 'Password is required';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission event by validating inputs and navigating to the home page if valid.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (validateForm()) {
      navigate('/home', { replace: true });
    }
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
              autoComplete={false}
              placeholder='Please enter your email'
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className='error-message'>{errors.email}</span>}
          </div>
          <div className='form-line'>
            <div className='label-line flex flex-h-center flex-space-between'>
              <label htmlFor='password' className='text-shadow'>
                Password
              </label>
              <Link to='/' className='text-shadow'>
                Forgot password?
              </Link>
            </div>
            <Input
              required
              tabIndex={0}
              name='password'
              type='password'
              value={password}
              autoComplete={false}
              placeholder='Please enter your password'
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className='error-message'>{errors.password}</span>}
          </div>
          <div className='form-line'>
            <Button type='submit' text='Sign in' tabIndex={0} />
          </div>
        </form>

        <div className='links'>
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Sentry } from '../sentry';

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!username.trim() || !password) {
      const message = 'Enter your username and password.';
      setError(message);
      Sentry.captureMessage(`Sign-on validation error: ${message}`, { level: 'warning' });
      return;
    }
    navigate('/accounts', { replace: true });
  };

  return (
    <div className='wf-page wf-signon-page'>
      <header className='wf-header'>
        <div className='wf-topbar'>
          <div className='container flex flex-v-center flex-space-between'>
            <span className='wf-wordmark no-select'>WELLS FARGO</span>
            <span className='wf-greeting'>Online Banking</span>
          </div>
        </div>
        <div className='wf-stripe' aria-hidden='true' />
      </header>

      <main className='container wf-main flex flex-h-center'>
        <section className='wf-signon' aria-labelledby='signon-title'>
          <h1 id='signon-title'>Sign On</h1>
          <p className='wf-muted'>Demo environment - any username and password will sign you on.</p>
          <form className='wf-form' onSubmit={handleSubmit} noValidate>
            <div className='form-line'>
              <label htmlFor='username'>Username</label>
              <input
                id='username'
                name='username'
                type='text'
                className='input'
                autoComplete='username'
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError('');
                }}
              />
            </div>
            <div className='form-line'>
              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                className='input'
                autoComplete='current-password'
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
              />
            </div>
            {error && (
              <p className='input-error-message' role='alert'>
                {error}
              </p>
            )}
            <div className='form-line'>
              <button type='submit' className='button wf-button-primary'>
                Sign On
              </button>
            </div>
          </form>
          <div className='wf-signon-links'>
            <a href='#forgot' onClick={(event) => event.preventDefault()}>
              Forgot username or password?
            </a>
            <a href='#enroll' onClick={(event) => event.preventDefault()}>
              Enroll now
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Signin;

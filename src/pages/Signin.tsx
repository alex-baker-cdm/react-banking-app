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
      Sentry.captureMessage(`Sign-in validation error: ${message}`, { level: 'warning' });
      return;
    }
    navigate('/watchlists', { replace: true });
  };

  return (
    <div className='sp-page sp-signon-page'>
      <header className='sp-header'>
        <div className='sp-topbar'>
          <div className='container flex flex-v-center flex-space-between'>
            <span className='sp-wordmark no-select'>S&amp;P Global</span>
            <span className='sp-greeting'>Market Intelligence</span>
          </div>
        </div>
        <div className='sp-stripe' aria-hidden='true' />
      </header>

      <main className='container sp-main flex flex-h-center'>
        <section className='sp-signon' aria-labelledby='signon-title'>
          <h1 id='signon-title'>Sign in</h1>
          <p className='sp-muted'>Demo environment - any username and password will sign you in.</p>
          <form className='sp-form' onSubmit={handleSubmit} noValidate>
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
              <button type='submit' className='button sp-button-primary'>
                Sign in
              </button>
            </div>
          </form>
          <div className='sp-signon-links'>
            <a href='#forgot' onClick={(event) => event.preventDefault()}>
              Forgot username or password?
            </a>
          </div>
        </section>
      </main>
      <footer className='sp-footer'>
        <div className='container'>
          <p>Demo environment with illustrative data. Not affiliated with S&amp;P Global Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default Signin;

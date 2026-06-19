import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Signin from '../Signin';
import { AuthProvider } from '../../context/AuthContext';

// Mock Sentry
jest.mock('../../sentry', () => ({
  Sentry: {
    captureMessage: jest.fn(),
  },
}));

const renderSignin = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<Signin />} />
          <Route path='/home' element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe('Signin', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders the sign in form', () => {
    renderSignin();
    expect(screen.getByPlaceholderText('Please enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Please enter your password')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('shows email error when email is empty', () => {
    renderSignin();
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('shows email error for invalid email', () => {
    renderSignin();
    fireEvent.change(screen.getByPlaceholderText('Please enter your email'), {
      target: { value: 'notanemail' },
    });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('shows password error when password is empty', () => {
    renderSignin();
    fireEvent.change(screen.getByPlaceholderText('Please enter your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows password error when password is too short', () => {
    renderSignin();
    fireEvent.change(screen.getByPlaceholderText('Please enter your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Please enter your password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('navigates to /home and stores auth on valid submit', () => {
    renderSignin();
    fireEvent.change(screen.getByPlaceholderText('Please enter your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Please enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(sessionStorage.getItem('auth')).toBe(JSON.stringify({ email: 'user@example.com' }));
  });
});

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

const renderWithAuth = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    sessionStorage.setItem('auth', JSON.stringify({ email: 'test@example.com' }));
  } else {
    sessionStorage.removeItem('auth');
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path='/' element={<div>Sign In Page</div>} />
          <Route
            path='/protected'
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('redirects to / when not authenticated', () => {
    renderWithAuth(false);
    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithAuth(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Sign In Page')).not.toBeInTheDocument();
  });
});

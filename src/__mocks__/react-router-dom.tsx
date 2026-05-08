// Lightweight stub of react-router-dom for Jest.
// react-router-dom v7 ships ESM via package.json `exports` which Jest 27 (the
// version bundled with react-scripts 5) cannot resolve. This stub gives the
// component tree a working `Link`/`NavLink`/router-hook surface so tests can
// render pages that pull in the navigation chrome (Header, etc.) without
// pulling in the real router.

import * as React from 'react';

interface LinkLikeProps {
  children?: React.ReactNode;
  to: string;
  className?: string;
  [key: string]: unknown;
}

const renderAnchor = ({ children, to, ...rest }: LinkLikeProps): React.ReactElement =>
  React.createElement(
    'a',
    { href: typeof to === 'string' ? to : '#', ...rest },
    children
  );

export const Link: React.FC<LinkLikeProps> = renderAnchor;
export const NavLink: React.FC<LinkLikeProps> = renderAnchor;

export const BrowserRouter: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const MemoryRouter: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const Routes: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const Route: React.FC<{ element?: React.ReactNode }> = ({ element }) =>
  React.createElement(React.Fragment, null, element ?? null);

export const Outlet: React.FC = () => null;

export const useNavigate = (): (() => void) => () => {
  // no-op in tests
};

export const useLocation = (): { pathname: string; search: string; hash: string; state: null } => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
});

export const useParams = (): Record<string, string> => ({});

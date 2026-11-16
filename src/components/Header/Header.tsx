import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => (
  <header className='sp-header'>
    <div className='sp-topbar'>
      <div className='container flex flex-v-center flex-space-between'>
        <div className='flex flex-v-center'>
          <Link to='/watchlists' className='sp-wordmark no-select' aria-label='S&amp;P Global home'>
            S&amp;P Global
          </Link>
          <span className='sp-product'>Market Intelligence</span>
        </div>
        <nav className='sp-topnav flex flex-v-center' aria-label='Account navigation'>
          <span className='sp-greeting'>Alex Baker</span>
          <Link to='/' className='sp-signoff'>
            Sign off
          </Link>
        </nav>
      </div>
    </div>
    <div className='sp-stripe' aria-hidden='true' />
    <nav className='sp-subnav' aria-label='Primary'>
      <div className='container flex flex-v-center'>
        <NavLink to='/watchlists' className={({ isActive }) => (isActive ? 'active' : '')}>
          Watchlists
        </NavLink>
        <NavLink to='/alerts' className={({ isActive }) => (isActive ? 'active' : '')}>
          Alerts
        </NavLink>
      </div>
    </nav>
  </header>
);

export default Header;

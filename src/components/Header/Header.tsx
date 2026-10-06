import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => (
  <header className='wf-header'>
    <div className='wf-topbar'>
      <div className='container flex flex-v-center flex-space-between'>
        <Link to='/accounts' className='wf-wordmark no-select' aria-label='Wells Fargo home'>
          WELLS FARGO
        </Link>
        <nav className='wf-topnav flex flex-v-center' aria-label='Account navigation'>
          <span className='wf-greeting'>Good morning, Alex</span>
          <Link to='/' className='wf-signoff'>
            Sign off
          </Link>
        </nav>
      </div>
    </div>
    <div className='wf-stripe' aria-hidden='true' />
    <nav className='wf-subnav' aria-label='Primary'>
      <div className='container flex flex-v-center'>
        <NavLink to='/accounts' className={({ isActive }) => (isActive ? 'active' : '')}>
          Accounts
        </NavLink>
        <NavLink to='/transfer' className={({ isActive }) => (isActive ? 'active' : '')}>
          Transfer &amp; Pay
        </NavLink>
        <a href='#plan' onClick={(event) => event.preventDefault()}>
          Plan &amp; Learn
        </a>
        <a href='#security' onClick={(event) => event.preventDefault()}>
          Security &amp; Support
        </a>
      </div>
    </nav>
  </header>
);

export default Header;

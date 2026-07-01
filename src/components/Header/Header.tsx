import { useRef } from 'react';

import { Link } from 'react-router-dom';

// Renders the top navigation bar with profile avatar, search input, and icon links
const Header: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className='flex flex-v-center flex-space-between'>
      {/* Profile avatar linking to the profile page */}
      <div className='header-profile flex flex-1'>
        <Link to='/profile'>
          <div className='profile-photo' style={{ backgroundImage: 'url("images/profile.jpg")' }} />
        </Link>
      </div>
      {/* Centered search bar */}
      <div className='header-center'>
        <div className='header-search flex flex-v-center'>
          <span
            tabIndex={0}
            role='button'
            onKeyDown={() => {}}
            onClick={() => {
              inputRef.current?.focus();
            }}
            className='material-symbols-outlined no-select'
          >
            search
          </span>
          <input ref={inputRef} type='text' name='search' id='search' placeholder='Search' />
        </div>
      </div>
      {/* Quick-access icon links for transactions and cards */}
      <div className='header-buttons flex flex-1 flex-v-center flex-end'>
        <Link to='/transactions' className='header-button flex flex-v-center flex-h-center'>
          <span className='material-symbols-outlined'>equalizer</span>
        </Link>
        <Link to='/cards' className='header-button flex flex-v-center flex-h-center'>
          <span className='material-symbols-outlined'>credit_card</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;

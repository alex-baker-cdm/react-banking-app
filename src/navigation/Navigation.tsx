import { Routes, Route, Navigate } from 'react-router-dom';

// components
import Signin from '../pages/Signin';
import Watchlists from '../pages/Watchlists';
import CompanyProfile from '../pages/CompanyProfile';
import Alerts from '../pages/Alerts';

const Navigation: React.FC = () => (
  <Routes>
    <Route path='/' element={<Signin />} />
    <Route path='/watchlists' element={<Watchlists />} />
    <Route path='/companies/:id' element={<CompanyProfile />} />
    <Route path='/alerts' element={<Alerts />} />
    <Route path='*' element={<Navigate to='/' replace />} />
  </Routes>
);

export default Navigation;

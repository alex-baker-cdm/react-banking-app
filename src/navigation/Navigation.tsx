import { Routes, Route, Navigate } from 'react-router-dom';

// components
import Signin from '../pages/Signin';
import Accounts from '../pages/Accounts';
import AccountDetail from '../pages/AccountDetail';
import Transfer from '../pages/Transfer';
import Statements from '../pages/Statements';

const Navigation: React.FC = () => (
  <Routes>
    <Route path='/' element={<Signin />} />
    <Route path='/accounts' element={<Accounts />} />
    <Route path='/accounts/:id' element={<AccountDetail />} />
    <Route path='/transfer' element={<Transfer />} />
    <Route path='/statements' element={<Statements />} />
    <Route path='*' element={<Navigate to='/' replace />} />
  </Routes>
);

export default Navigation;

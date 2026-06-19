import { Routes, Route } from 'react-router-dom';

// components
import Add from '../pages/Add';
import Bills from '../pages/Bills';
import Home from '../pages/Home';
import Cards from '../pages/Cards';
import Signin from '../pages/Signin';
import Profile from '../pages/Profile';
import Savings from '../pages/Savings';
import SendMoney from '../pages/SendMoney';
import Analytics from '../pages/Analytics';
import Notifications from '../pages/Notifications';
import Statements from '../pages/Statements';
import Transactions from '../pages/Transactions';

const Navigation: React.FC = () => (
  <Routes>
    <Route path='/' element={<Signin />} />
    <Route path='/add' element={<Add />} />
    <Route path='/bills' element={<Bills />} />
    <Route path='/home' element={<Home />} />
    <Route path='/cards' element={<Cards />} />
    <Route path='/profile' element={<Profile />} />
    <Route path='/savings' element={<Savings />} />
    <Route path='/send' element={<SendMoney />} />
    <Route path='/analytics' element={<Analytics />} />
    <Route path='/notifications' element={<Notifications />} />
    <Route path='/statements' element={<Statements />} />
    <Route path='/transactions' element={<Transactions />} />
  </Routes>
);

export default Navigation;

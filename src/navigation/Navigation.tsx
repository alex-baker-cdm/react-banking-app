import { Routes, Route } from 'react-router-dom';

// components
import Add from '../pages/Add';
import Home from '../pages/Home';
import Cards from '../pages/Cards';
import Signin from '../pages/Signin';
import Profile from '../pages/Profile';
import Savings from '../pages/Savings';
import SendMoney from '../pages/SendMoney';
import Transactions from '../pages/Transactions';
import ProtectedRoute from '../components/ProtectedRoute';

const Navigation: React.FC = () => (
  <Routes>
    <Route path='/' element={<Signin />} />
    <Route
      path='/add'
      element={
        <ProtectedRoute>
          <Add />
        </ProtectedRoute>
      }
    />
    <Route
      path='/home'
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      }
    />
    <Route
      path='/cards'
      element={
        <ProtectedRoute>
          <Cards />
        </ProtectedRoute>
      }
    />
    <Route
      path='/profile'
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path='/savings'
      element={
        <ProtectedRoute>
          <Savings />
        </ProtectedRoute>
      }
    />
    <Route
      path='/send'
      element={
        <ProtectedRoute>
          <SendMoney />
        </ProtectedRoute>
      }
    />
    <Route
      path='/transactions'
      element={
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default Navigation;

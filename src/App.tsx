import Navigation from './navigation/Navigation';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => (
  <NotificationProvider>
    <Navigation />
  </NotificationProvider>
);

export default App;

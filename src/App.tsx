import Navigation from './navigation/Navigation';

import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => (
  <ThemeProvider>
    <Navigation />
  </ThemeProvider>
);

export default App;

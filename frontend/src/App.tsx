import { useState } from 'react';
import Dashboard from './Dashboard';
import Auth from './Auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <Auth onLogin={() => setIsAuthenticated(true)} />
  );
}

export default App;

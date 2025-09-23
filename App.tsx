import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('medirem-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (isGuest: boolean) => {
    const newUser: User = { isLoggedIn: true, isGuest, name: isGuest ? 'Guest' : 'User' };
    setUser(newUser);
    localStorage.setItem('medirem-user', JSON.stringify(newUser));
  };

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('medirem-user');
    // Also clear medicine data on logout for privacy
    localStorage.removeItem('medirem-medicines');
  }, []);

  if (!user?.isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;
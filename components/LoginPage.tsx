import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (isGuest: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login, any non-empty user/pass works
    if (email && password) {
      onLogin(false);
    } else {
      alert("Please enter email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 transform transition-all hover:scale-105 duration-300">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h1 className="mt-4 text-3xl font-extrabold text-text-primary">Welcome to Medirem</h1>
          <p className="mt-2 text-text-secondary">Your personal medication assistant.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLoginSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-accent rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
              placeholder="john@doe.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-accent rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105 duration-300">
            Sign In
          </button>
        </form>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button onClick={() => onLogin(true)} className="w-full bg-gray-100 text-text-secondary py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-transform transform hover:scale-105 duration-300">
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
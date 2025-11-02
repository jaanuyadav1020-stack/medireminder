import React, { useState } from 'react';
import { User } from '../types';
import { useLocalization, availableLanguages } from '../hooks/useLocalization';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { language, setLanguage, t } = useLocalization();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-text-primary">Medirem</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary hidden sm:block">{t('header.greeting', { name: user.name || 'User' })}</span>
            
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-1 bg-gray-100 text-text-secondary font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.512 5.73 6.512 5.73a3.498 3.498 0 000 5.464 3.498 3.498 0 000 5.464l-2.07-1.202a6.012 6.012 0 010-9.458zM15.668 11.973c-1.386.799-1.386 2.396 0 3.194a6.012 6.012 0 01-1.912 2.706C13.488 17.27 13.488 17.27 13.488 17.27a3.498 3.498 0 000-5.464 3.498 3.498 0 000-5.464l2.07 1.202a6.012 6.012 0 010 9.458z" clipRule="evenodd" /></svg>
                <span>{availableLanguages[language]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20" onMouseLeave={() => setIsDropdownOpen(false)}>
                  <ul className="py-1">
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <li key={code}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setLanguage(code as any); setIsDropdownOpen(false); }} className={`block px-4 py-2 text-sm ${language === code ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}>
                          {name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="bg-gray-200 text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              {t('header.logoutButton')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left side - menu button and branding */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center ml-2 lg:ml-0">
            <img src="/favicon.svg" alt="LeadFlow Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">
              LeadFlow
              <span className="text-brand">.</span>
            </h1>
          </div>
        </div>
        
        {/* Right side - role toggle and notifications */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Welcome, {user?.name}
          </div>
          
          <button
            className="text-gray-500 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center text-white hover:bg-gray-700"
            title="Logout"
          >
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
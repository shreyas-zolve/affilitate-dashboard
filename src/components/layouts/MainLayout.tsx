import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { RoleProvider } from '../../context/RoleContext';
import { AuthProvider } from '../../context/AuthContext';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <RoleProvider>
      <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        className="lg:hidden fixed inset-0 z-40 transition-transform transform"
      />
      
      {/* Desktop sidebar */}
      <Sidebar 
        isOpen={true} 
        className="hidden lg:block lg:flex-shrink-0 w-64 border-r border-gray-200" 
      />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </RoleProvider>
    </AuthProvider>
  );
};

export default MainLayout;
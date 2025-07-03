import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, List, PlusCircle, Upload, Download, Users, Key } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, className }) => {
  const { role } = useRole();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const showAdminFeatures = role === 'company_admin';
  
  if (!isOpen) return null;
  
  return (
    <aside className={`bg-white h-full ${className}`}>
      <div className="h-full flex flex-col overflow-y-auto">
        {onClose && (
          <div className="px-4 py-3 flex justify-end lg:hidden">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>
        )}
        
        <div className="flex-1 px-4 py-6 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/dashboard')
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={18} className="mr-3" />
            Dashboard
          </Link>
          
          <Link
            to="/leads"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/leads')
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List size={18} className="mr-3" />
            Leads
          </Link>
          
          <Link
            to="/add-lead"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/add-lead')
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <PlusCircle size={18} className="mr-3" />
            Add Lead
          </Link>
          
          {showAdminFeatures && (
            <>
              <Link
                to="/bulk-upload"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/bulk-upload')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Upload size={18} className="mr-3" />
                Bulk Upload
              </Link>
              
              <Link
                to="/export"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/export')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Download size={18} className="mr-3" />
                Export CSV
              </Link>
              
              <Link
                to="/affiliates"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location.pathname.startsWith('/affiliates')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={18} className="mr-3" />
                Affiliates
              </Link>

              <Link
                to="/api-integration"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location.pathname.startsWith('/api-integration')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Key size={18} className="mr-3" />
                API Integration
              </Link>
            </>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-xs font-medium text-brand-800">
                  {role === 'company_admin' ? 'CA' : 'AA'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {role === 'company_admin' ? 'Company Admin' : 'Affiliate Admin'}
              </p>
              <p className="text-xs text-gray-500">
                {role === 'company_admin' ? 'Full access' : 'Admin access'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
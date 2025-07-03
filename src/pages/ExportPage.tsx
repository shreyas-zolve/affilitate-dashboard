import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import leadService, { LeadFilter } from '../services/leadService';
import { useAuth } from '../context/AuthContext';

const ExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });
  
  // Handle status filter checkboxes
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setStatusFilter([]);
    setDateRange({ startDate: null, endDate: null });
  };
  
  // Export leads to CSV
  const exportLeads = async () => {
    setDownloading(true);
    
    const filters: LeadFilter = {};
    
    if (statusFilter.length > 0) {
      filters.status = statusFilter;
    }
    
    if (dateRange.startDate) {
      filters.startDate = dateRange.startDate.toISOString();
    }
    
    if (dateRange.endDate) {
      filters.endDate = dateRange.endDate.toISOString();
    }
    
    try {
      const blob = await leadService.exportLeadsToCsv(filters);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Leads exported successfully');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Export Leads</h1>
        <p className="mt-1 text-sm text-gray-600">
          Export lead data to CSV format with optional filters
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Export Options</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="status-new"
                        type="checkbox"
                        className="h-4 w-4 text-brand focus:ring-brand-500"
                        checked={statusFilter.includes('new')}
                        onChange={() => handleStatusFilterChange('new')}
                      />
                      <label htmlFor="status-new" className="ml-2 text-sm text-gray-700">
                        All Leads
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="status-in-review"
                        type="checkbox"
                        className="h-4 w-4 text-brand focus:ring-brand-500"
                        checked={statusFilter.includes('in_review')}
                        onChange={() => handleStatusFilterChange('in_review')}
                      />
                      <label htmlFor="status-in-review" className="ml-2 text-sm text-gray-700">
                        Signup Completed
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="status-approved"
                        type="checkbox"
                        className="h-4 w-4 text-brand focus:ring-brand-500"
                        checked={statusFilter.includes('approved')}
                        onChange={() => handleStatusFilterChange('approved')}
                      />
                      <label htmlFor="status-approved" className="ml-2 text-sm text-gray-700">
                        Checking Account Created
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="status-rejected"
                        type="checkbox"
                        className="h-4 w-4 text-brand focus:ring-brand-500"
                        checked={statusFilter.includes('rejected')}
                        onChange={() => handleStatusFilterChange('rejected')}
                      />
                      <label htmlFor="status-rejected" className="ml-2 text-sm text-gray-700">
                        Credit Card Created
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <DatePicker
                        selected={dateRange.startDate}
                        onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                        selectsStart
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        placeholderText="Start Date"
                        className="input pl-9"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      minDate={dateRange.startDate}
                      placeholderText="End Date"
                      className="input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={exportLeads}
                  disabled={downloading}
                  className="btn btn-primary"
                >
                  {downloading ? (
                    <>
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Export as CSV
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset Filters
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/leads')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Export Information</h2>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-600 mb-4">
                The CSV export will include the following columns:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Email</span>
                </li>
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Phone</span>
                </li>
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Signup Date</span>
                </li>
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Checking Account Status</span>
                </li>
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Credit Card Status</span>
                </li>
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Lead Created Date</span>
                </li>
                <li className="flex items-start">
                  <Filter className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>Last Updated</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Notes:</h3>
                <ul className="space-y-1 text-sm list-disc pl-5">
                  <li>Use the filters to narrow down the leads you want to export</li>
                  <li>The export will include all leads you have permission to view</li>
                  <li>Documents cannot be exported</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Download, Plus, UploadCloud, ChevronLeft, 
  ChevronRight, ChevronDown 
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import leadService, { Lead, LeadsPaginationParams, LeadsResponse } from '../services/leadService';
import { useAuth } from '../context/AuthContext';

const LeadsListPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    setSearchTerm('');
    setDateRange({ startDate: null, endDate: null });
  };
  
  // Fetch leads with current pagination and filters
  const fetchLeads = async () => {
    setLoading(true);
    
    const params: LeadsPaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        status: statusFilter.length > 0 ? statusFilter : undefined,
        search: searchTerm || undefined,
        startDate: dateRange.startDate ? dateRange.startDate.toISOString() : undefined,
        endDate: dateRange.endDate ? dateRange.endDate.toISOString() : undefined
      }
    };
    
    try {
      const response: LeadsResponse = await leadService.getLeads(params);
      setLeads(response.leads);
      setTotalLeads(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update leads when pagination or filters change
  useEffect(() => {
    fetchLeads();
  }, [page, limit, sortBy, sortOrder]);
  
  // Apply filters when user clicks apply button
  const applyFilters = () => {
    setPage(1); // Reset to first page
    fetchLeads();
  };
  
  // Handle sort change
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="badge-new">New</span>;
      case 'in_review':
        return <span className="badge-in-review">In Review</span>;
      case 'approved':
        return <span className="badge-approved">Approved</span>;
      case 'rejected':
        return <span className="badge-rejected">Rejected</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
        
        <div className="flex flex-wrap gap-2">
          <Link to="/add-lead" className="btn btn-primary">
            <Plus size={16} className="mr-2" />
            Add Lead
          </Link>
          
          {(user?.role === 'company_admin' || user?.role === 'affiliate_admin') && (
            <>
              <Link to="/bulk-upload" className="btn btn-secondary">
                <UploadCloud size={16} className="mr-2" />
                Bulk Upload
              </Link>
              
              <Link to="/export" className="btn btn-secondary">
                <Download size={16} className="mr-2" />
                Export CSV
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="card mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="input pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
              }}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 rounded-b-lg animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      New
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
                      In Review
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
                      Approved
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
                      Rejected
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <DatePicker
                    selected={dateRange.startDate}
                    onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                    selectsStart
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    placeholderText="Start Date"
                    className="input"
                  />
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
              
              <div className="flex items-end">
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={applyFilters}
                    className="btn btn-primary"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="table-wrapper">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortBy === 'name' && (
                    <ChevronDown
                      size={16}
                      className={`ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>Affiliate</th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortBy === 'status' && (
                    <ChevronDown
                      size={16}
                      className={`ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Submission Date
                  {sortBy === 'createdAt' && (
                    <ChevronDown
                      size={16}
                      className={`ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('updatedAt')}
              >
                <div className="flex items-center">
                  Last Updated
                  {sortBy === 'updatedAt' && (
                    <ChevronDown
                      size={16}
                      className={`ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <div className="flex justify-center">
                    <svg 
                      className="animate-spin h-6 w-6 text-brand" 
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
                  </div>
                </td>
              </tr>
            ) : leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="font-medium text-brand">
                    <Link to={`/leads/${lead.id}`} className="hover:underline">
                      {lead.name}
                    </Link>
                  </td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.affiliateName}</td>
                  <td>{getStatusBadge(lead.status)}</td>
                  <td>{formatDate(lead.createdAt)}</td>
                  <td>{formatDate(lead.updatedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No leads found. Try adjusting your filters or add a new lead.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">
            Show
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset to first page when changing limit
            }}
            className="input py-1 w-20"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700 ml-2">
            per page
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-4">
            Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalLeads)} of {totalLeads} leads
          </span>
          
          <div className="flex items-center">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-md border border-gray-300 mr-2 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsListPage;
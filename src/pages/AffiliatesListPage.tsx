import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

// Mock data
const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@affiliate1.com',
    company: 'Affiliate One LLC',
    status: 'active',
    lastLogin: '2024-03-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@affiliate2.com',
    company: 'Second Affiliate Inc',
    status: 'inactive',
    lastLogin: '2024-03-14T09:15:00Z'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@affiliate3.com',
    company: 'Third Partner Co',
    status: 'active',
    lastLogin: '2024-03-15T11:45:00Z'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@affiliate4.com',
    company: 'Fourth Affiliate Group',
    status: 'inactive',
    lastLogin: '2024-03-13T16:20:00Z'
  }
];

const AffiliatesListPage: React.FC = () => {
  const [affiliates] = useState<Affiliate[]>(mockAffiliates);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="badge-approved">Active</span>;
    }
    return <span className="badge-rejected">Inactive</span>;
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Affiliates</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your affiliate partners and their access
        </p>
      </div>
      
      <div className="card mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search affiliates..."
              className="input pl-9"
            />
          </div>
          
          <button className="btn btn-secondary">
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th>
                <div className="flex items-center">
                  Name
                  <ChevronDown size={16} className="ml-1" />
                </div>
              </th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>
                <div className="flex items-center">
                  Last Login
                  <ChevronDown size={16} className="ml-1" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {affiliates.map((affiliate) => (
              <tr key={affiliate.id}>
                <td className="font-medium text-brand">
                  <Link to={`/affiliates/${affiliate.id}`} className="hover:underline">
                    {affiliate.name}
                  </Link>
                </td>
                <td>{affiliate.email}</td>
                <td>{affiliate.company}</td>
                <td>{getStatusBadge(affiliate.status)}</td>
                <td>{formatDate(affiliate.lastLogin)}</td>
              </tr>
            ))}
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
            Showing {affiliates.length} of {affiliates.length} affiliates
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
              onClick={() => setPage((prev) => prev + 1)}
              disabled={true}
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

export default AffiliatesListPage;
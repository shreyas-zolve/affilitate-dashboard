import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import leadService from '../services/leadService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  
  const [activeFilter, setActiveFilter] = useState<string>('30days');
  
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await leadService.getDashboardMetrics({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });
      setMetrics(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (filter: string) => {
    let startDate = new Date();
    const endDate = new Date();
    
    switch (filter) {
      case '7days':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        return;
    }
    
    setDateRange({ startDate, endDate });
    setActiveFilter(filter);
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Mock affiliate earnings data
  const affiliateEarnings = {
    totalEarnings: 21850,
    thisMonth: 4850,
    lastMonth: 3650,
    growth: 32.9
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-1">
            <button 
              onClick={() => handleFilterChange('7days')}
              className={`btn ${activeFilter === '7days' ? 'btn-primary' : 'btn-secondary'}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => handleFilterChange('30days')}
              className={`btn ${activeFilter === '30days' ? 'btn-primary' : 'btn-secondary'}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => handleFilterChange('90days')}
              className={`btn ${activeFilter === '90days' ? 'btn-primary' : 'btn-secondary'}`}
            >
              90 Days
            </button>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 h-4 w-4 text-gray-400" />
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => setDateRange({ ...dateRange, startDate: date as Date })}
                selectsStart
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                className="input pl-9"
              />
            </div>
            <span className="text-gray-500">to</span>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date as Date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="input"
            />
            <button 
              onClick={() => setActiveFilter('custom')}
              className="btn btn-secondary"
              aria-label="Apply custom date range"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <svg 
              className="animate-spin h-10 w-10 text-brand mb-4" 
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
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'company_admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-6`}>
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-medium text-gray-500">Total Leads</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{formatNumber(metrics?.totalLeads || 0)}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {metrics?.leadsTrend >= 0 ? (
                    <span className="text-success">+{metrics?.leadsTrend}%</span>
                  ) : (
                    <span className="text-danger">{metrics?.leadsTrend}%</span>
                  )}
                  <span className="ml-1">from previous period</span>
                </p>
              </div>
            </div>
            
            {user?.role === 'company_admin' ? (
              <>
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-500">Signups Completed</h3>
                      <span className="text-xs text-brand">Coming Soon</span>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">--</p>
                    <p className="mt-2 text-sm text-gray-500">Feature in development</p>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-500">Checking Accounts Created</h3>
                      <span className="text-xs text-brand">Coming Soon</span>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">--</p>
                    <p className="mt-2 text-sm text-gray-500">Feature in development</p>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-500">Credit Cards Created</h3>
                      <span className="text-xs text-brand">Coming Soon</span>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">--</p>
                    <p className="mt-2 text-sm text-gray-500">Feature in development</p>
                  </div>
                </div>
              </>
            ) : (
              /* Affiliate Revenue Glimpse */
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-500">My Earnings</h3>
                    <Link 
                      to="/my-earnings" 
                      className="text-brand hover:text-brand-700 flex items-center text-sm font-medium"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </Link>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900">{formatCurrency(affiliateEarnings.totalEarnings)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {formatCurrency(affiliateEarnings.thisMonth)} this month
                    </p>
                    <p className="text-sm text-green-600">
                      +{affiliateEarnings.growth}% growth
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Leads by Status</h3>
                <button className="text-gray-400 hover:text-gray-500" onClick={fetchDashboardData}>
                  <RefreshCw size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.leadsByStatus || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Number of Leads" 
                        fill="#FF6633" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Lead Trends</h3>
                <button className="text-gray-400 hover:text-gray-500" onClick={fetchDashboardData}>
                  <RefreshCw size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.leadTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="leads" 
                        name="New Leads" 
                        stroke="#FF6633" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="approved" 
                        name="Approved" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Affiliates */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">Top Affiliates</h3>
                <span className="ml-2 text-xs text-brand">Coming Soon</span>
              </div>
              <button className="btn btn-secondary" disabled>
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
            <div className="card-body p-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Affiliate tracking features are coming soon!</p>
                  <p className="text-sm text-gray-400 mt-1">Track affiliate performance and manage relationships</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
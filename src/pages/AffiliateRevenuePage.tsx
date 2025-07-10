import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, Download, Filter, 
  ChevronDown, Eye, CreditCard, Users 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';

// Mock data for affiliate earnings
const monthlyEarnings = [
  { month: 'Jan 2024', earnings: 2450, leads: 12, conversions: 8, conversionRate: 67 },
  { month: 'Feb 2024', earnings: 3200, leads: 16, conversions: 11, conversionRate: 69 },
  { month: 'Mar 2024', earnings: 2800, leads: 14, conversions: 9, conversionRate: 64 },
  { month: 'Apr 2024', earnings: 4100, leads: 20, conversions: 14, conversionRate: 70 },
  { month: 'May 2024', earnings: 3650, leads: 18, conversions: 12, conversionRate: 67 },
  { month: 'Jun 2024', earnings: 4850, leads: 24, conversions: 17, conversionRate: 71 },
];

const serviceBreakdown = [
  { name: 'Credit Cards', value: 8500, color: '#FF6633' },
  { name: 'Checking Accounts', value: 6200, color: '#10B981' },
  { name: 'Auto Loans', value: 4300, color: '#3B82F6' },
  { name: 'Insurance', value: 2800, color: '#F59E0B' },
];

const recentPayments = [
  {
    id: '1',
    date: '2024-06-15',
    amount: 4850,
    period: 'June 2024',
    status: 'paid',
    leads: 24,
    conversions: 17
  },
  {
    id: '2',
    date: '2024-05-15',
    amount: 3650,
    period: 'May 2024',
    status: 'paid',
    leads: 18,
    conversions: 12
  },
  {
    id: '3',
    date: '2024-04-15',
    amount: 4100,
    period: 'April 2024',
    status: 'paid',
    leads: 20,
    conversions: 14
  },
  {
    id: '4',
    date: '2024-03-15',
    amount: 2800,
    period: 'March 2024',
    status: 'paid',
    leads: 14,
    conversions: 9
  },
];

const AffiliateRevenuePage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date()
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'breakdown'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadReport = () => {
    toast.success('Earnings report downloaded successfully');
  };

  const totalEarnings = monthlyEarnings.reduce((sum, month) => sum + month.earnings, 0);
  const totalLeads = monthlyEarnings.reduce((sum, month) => sum + month.leads, 0);
  const totalConversions = monthlyEarnings.reduce((sum, month) => sum + month.conversions, 0);
  const avgConversionRate = Math.round(totalConversions / totalLeads * 100);

  const currentMonth = monthlyEarnings[monthlyEarnings.length - 1];
  const previousMonth = monthlyEarnings[monthlyEarnings.length - 2];
  const earningsGrowth = ((currentMonth.earnings - previousMonth.earnings) / previousMonth.earnings * 100).toFixed(1);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Earnings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your affiliate earnings and performance metrics
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
          </div>
          
          <button onClick={downloadReport} className="btn btn-secondary">
            <Download size={16} className="mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-brand" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalEarnings)}</p>
                <p className="text-sm text-green-600">
                  +{earningsGrowth}% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                <p className="text-2xl font-semibold text-gray-900">{totalLeads}</p>
                <p className="text-sm text-gray-500">
                  {currentMonth.leads} this month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Conversions</h3>
                <p className="text-2xl font-semibold text-gray-900">{totalConversions}</p>
                <p className="text-sm text-gray-500">
                  {currentMonth.conversions} this month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                <p className="text-2xl font-semibold text-gray-900">{avgConversionRate}%</p>
                <p className="text-sm text-gray-500">
                  {currentMonth.conversionRate}% this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'breakdown'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Service Breakdown
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Trend */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Earnings Trend</h3>
            </div>
            <div className="card-body">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                      }}
                      formatter={(value) => [formatCurrency(Number(value)), 'Earnings']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#FF6633" 
                      strokeWidth={3}
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Conversion Performance */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Conversion Performance</h3>
            </div>
            <div className="card-body">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="leads" name="Leads" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="conversions" name="Conversions" fill="#10B981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.leads}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.conversions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Breakdown Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Earnings by Service</h3>
            </div>
            <div className="card-body">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Service Performance</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {serviceBreakdown.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(service.value)}</div>
                      <div className="text-sm text-gray-500">
                        {((service.value / totalEarnings) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateRevenuePage;
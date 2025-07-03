import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Building2, Link as LinkIcon, ToggleLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

// Mock data
const mockAffiliate: Affiliate = {
  id: '1',
  name: 'John Smith',
  email: 'john@affiliate1.com',
  company: 'Affiliate One LLC',
  status: 'inactive',
  lastLogin: '2024-03-15T14:30:00Z',
  utmSource: 'affiliate_one',
  utmMedium: 'referral',
  utmCampaign: 'spring_2024'
};

const AffiliateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [affiliate] = useState<Affiliate>(mockAffiliate);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    utmSource: affiliate.utmSource,
    utmMedium: affiliate.utmMedium,
    utmCampaign: affiliate.utmCampaign
  });
  
  const handleStatusChange = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Affiliate ${affiliate.status === 'active' ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update affiliate status');
    }
  };
  
  const handleUtmUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('UTM parameters updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update UTM parameters');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/affiliates" className="mr-4 text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{affiliate.name}</h1>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500 mr-2">Affiliate ID: {affiliate.id}</span>
            <span className={`badge ${affiliate.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
              {affiliate.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Affiliate Information</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start mb-4">
                    <User className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{affiliate.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <Mail className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="mt-1 text-sm text-gray-900">{affiliate.email}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start mb-4">
                    <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Company</h3>
                      <p className="mt-1 text-sm text-gray-900">{affiliate.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <ToggleLeft className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(affiliate.lastLogin)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">UTM Parameters</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary"
                >
                  Edit Parameters
                </button>
              )}
            </div>
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleUtmUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="utmSource" className="label">
                        UTM Source
                      </label>
                      <input
                        type="text"
                        id="utmSource"
                        className="input"
                        value={formData.utmSource}
                        onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="utmMedium" className="label">
                        UTM Medium
                      </label>
                      <input
                        type="text"
                        id="utmMedium"
                        className="input"
                        value={formData.utmMedium}
                        onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="utmCampaign" className="label">
                        UTM Campaign
                      </label>
                      <input
                        type="text"
                        id="utmCampaign"
                        className="input"
                        value={formData.utmCampaign}
                        onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <LinkIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">UTM Source</h3>
                      <p className="mt-1 text-sm text-gray-900">{affiliate.utmSource}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <LinkIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">UTM Medium</h3>
                      <p className="mt-1 text-sm text-gray-900">{affiliate.utmMedium}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <LinkIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">UTM Campaign</h3>
                      <p className="mt-1 text-sm text-gray-900">{affiliate.utmCampaign}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </div>
            <div className="card-body">
              <button
                onClick={handleStatusChange}
                className={`btn w-full ${affiliate.status === 'active' ? 'btn-danger' : 'btn-success'}`}
              >
                {affiliate.status === 'active' ? 'Deactivate Affiliate' : 'Activate Affiliate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDetailPage;
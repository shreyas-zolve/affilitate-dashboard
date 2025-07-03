// Mock API service using localStorage for data persistence
import { jwtDecode } from 'jwt-decode';

const STORAGE_KEY = 'leadflow_data';

interface StorageData {
  leads: any[];
  users: any[];
}

// Initialize storage with mock data if empty
const initializeStorage = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const initialData: StorageData = {
      leads: [],
      users: [
        {
          id: '1',
          name: 'Company Admin',
          email: 'admin@company.com',
          password: 'Admin123!',
          role: 'company_admin'
        },
        {
          id: '2',
          name: 'Affiliate Admin',
          email: 'admin@affiliate.com',
          password: 'Affiliate123!',
          role: 'affiliate_admin',
          affiliateId: 'aff1'
        },
        {
          id: '3',
          name: 'Affiliate User',
          email: 'user@affiliate.com',
          password: 'User123!',
          role: 'affiliate_user',
          affiliateId: 'aff1'
        }
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

initializeStorage();

// Helper to get storage data
const getStorageData = (): StorageData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { leads: [], users: [] };
};

// Helper to save storage data
const saveStorageData = (data: StorageData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Mock API methods
const api = {
  post: async (url: string, data: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (url === '/auth/login') {
      const { email, password } = data;
      const storageData = getStorageData();
      const user = storageData.users.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Create JWT token
      const token = btoa(JSON.stringify({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        affiliateId: user.affiliateId,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      return { data: { token } };
    }

    if (url.startsWith('/leads')) {
      const storageData = getStorageData();
      const newLead = {
        id: `lead_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'new'
      };
      storageData.leads.push(newLead);
      saveStorageData(storageData);
      return { data: newLead };
    }

    throw new Error('Not implemented');
  },

  get: async (url: string, config?: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const storageData = getStorageData();

    if (url === '/leads') {
      const { page = 1, limit = 10 } = config?.params || {};
      const start = (page - 1) * limit;
      const end = start + limit;
      const leads = storageData.leads.slice(start, end);
      
      return {
        data: {
          leads,
          total: storageData.leads.length,
          page,
          totalPages: Math.ceil(storageData.leads.length / limit)
        }
      };
    }

    if (url.startsWith('/leads/')) {
      const id = url.split('/')[2];
      const lead = storageData.leads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');
      return { data: lead };
    }

    if (url === '/leads/metrics') {
      // Generate mock metrics
      return {
        data: {
          totalLeads: storageData.leads.length,
          leadsTrend: 15,
          conversionRate: 68,
          conversionTrend: 5,
          avgLoanAmount: 25000,
          avgLoanTrend: 8,
          activeAffiliates: 3,
          affiliatesTrend: 0,
          leadsByStatus: [
            { status: 'New', count: 12 },
            { status: 'In Review', count: 8 },
            { status: 'Approved', count: 15 },
            { status: 'Rejected', count: 5 }
          ],
          leadTrends: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            leads: Math.floor(Math.random() * 10) + 5,
            approved: Math.floor(Math.random() * 5) + 2
          }))
        }
      };
    }

    throw new Error('Not implemented');
  },

  put: async (url: string, data: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (url.includes('/status')) {
      const id = url.split('/')[2];
      const storageData = getStorageData();
      const leadIndex = storageData.leads.findIndex(l => l.id === id);
      
      if (leadIndex === -1) throw new Error('Lead not found');
      
      storageData.leads[leadIndex] = {
        ...storageData.leads[leadIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      saveStorageData(storageData);
      return { data: storageData.leads[leadIndex] };
    }

    throw new Error('Not implemented');
  }
};

export default api;
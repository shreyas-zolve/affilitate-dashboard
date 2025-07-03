import api from './api';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  loanAmount: number;
  notes?: string;
  status: 'new' | 'in_review' | 'approved' | 'rejected';
  affiliateId: string;
  affiliateName: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
  statusHistory?: StatusHistoryItem[];
  comments?: Comment[];
}

export interface Document {
  id: string;
  leadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface StatusHistoryItem {
  id: string;
  leadId: string;
  status: string;
  changedAt: string;
  changedBy: string;
  changedByName: string;
  notes?: string;
}

export interface Comment {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  loanAmount: number;
  notes?: string;
  documents?: File[];
}

export interface LeadFilter {
  status?: string[];
  affiliateId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LeadsPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: LeadFilter;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LeadStatusUpdateData {
  status: 'new' | 'in_review' | 'approved' | 'rejected';
  notes?: string;
}

export interface LeadCommentData {
  content: string;
}

// Get leads with pagination and filtering
const getLeads = async (params: LeadsPaginationParams): Promise<LeadsResponse> => {
  const { page, limit, sortBy, sortOrder, filters } = params;
  
  const response = await api.get('/leads', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    }
  });
  
  return response.data;
};

// Get a single lead by ID
const getLeadById = async (id: string): Promise<Lead> => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

// Create a new lead
const createLead = async (leadData: LeadFormData): Promise<Lead> => {
  // Create form data for multipart/form-data (for file uploads)
  const formData = new FormData();
  
  // Append text fields
  formData.append('name', leadData.name);
  formData.append('email', leadData.email);
  formData.append('phone', leadData.phone);
  
  if (leadData.address) {
    formData.append('address', leadData.address);
  }
  
  formData.append('loanAmount', leadData.loanAmount.toString());
  
  if (leadData.notes) {
    formData.append('notes', leadData.notes);
  }
  
  // Append documents if any
  if (leadData.documents && leadData.documents.length > 0) {
    leadData.documents.forEach((file, index) => {
      formData.append('documents', file);
    });
  }
  
  const response = await api.post('/leads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Update lead status
const updateLeadStatus = async (id: string, statusData: LeadStatusUpdateData): Promise<Lead> => {
  const response = await api.put(`/leads/${id}/status`, statusData);
  return response.data;
};

// Add a comment to a lead
const addLeadComment = async (id: string, commentData: LeadCommentData): Promise<Comment> => {
  const response = await api.post(`/leads/${id}/comments`, commentData);
  return response.data;
};

// Download documents as ZIP
const downloadLeadDocuments = async (id: string): Promise<Blob> => {
  const response = await api.get(`/leads/${id}/documents/download`, {
    responseType: 'blob'
  });
  return response.data;
};

// Upload bulk leads via CSV
const uploadBulkLeads = async (file: File): Promise<{ count: number; errors?: string[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/leads/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Export leads to CSV
const exportLeadsToCsv = async (filters?: LeadFilter): Promise<Blob> => {
  const response = await api.get('/leads/export', {
    params: filters,
    responseType: 'blob'
  });
  
  return response.data;
};

// Get a CSV template for bulk upload
const downloadCsvTemplate = async (): Promise<Blob> => {
  const response = await api.get('/leads/template', {
    responseType: 'blob'
  });
  
  return response.data;
};

// Get dashboard metrics
const getDashboardMetrics = async (dateRange?: { startDate: string; endDate: string }): Promise<any> => {
  const response = await api.get('/leads/metrics', {
    params: dateRange
  });
  
  return response.data;
};

export default {
  getLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  addLeadComment,
  downloadLeadDocuments,
  uploadBulkLeads,
  exportLeadsToCsv,
  downloadCsvTemplate,
  getDashboardMetrics
};
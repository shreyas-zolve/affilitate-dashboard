import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, FileText, Users, DollarSign, Phone, Mail, 
  MapPin, MessageSquare, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import leadService, { Lead, LeadStatusUpdateData, LeadCommentData } from '../services/leadService';
import { useAuth } from '../context/AuthContext';

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Fetch lead data
  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
  }, [id]);
  
  const fetchLead = async (leadId: string) => {
    setLoading(true);
    try {
      const data = await leadService.getLeadById(leadId);
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };
  
  // Update lead status
  const updateStatus = async (status: 'new' | 'in_review' | 'approved' | 'rejected') => {
    if (!id || !lead) return;
    
    setChangingStatus(true);
    try {
      const statusData: LeadStatusUpdateData = { status };
      const updatedLead = await leadService.updateLeadStatus(id, statusData);
      setLead(updatedLead);
      toast.success(`Lead status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update lead status');
    } finally {
      setChangingStatus(false);
    }
  };
  
  // Add comment
  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const commentData: LeadCommentData = { content: comment.trim() };
      await leadService.addLeadComment(id, commentData);
      
      // Refetch lead to get updated comments
      await fetchLead(id);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Download documents
  const downloadDocuments = async () => {
    if (!id) return;
    
    setDownloading(true);
    try {
      const blob = await leadService.downloadLeadDocuments(id);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `lead-${id}-documents.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Documents downloaded successfully');
    } catch (error) {
      console.error('Error downloading documents:', error);
      toast.error('Failed to download documents');
    } finally {
      setDownloading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Get status badge
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
  
  // Get status step completion class
  const getStatusStepClass = (stepStatus: string) => {
    if (!lead) return 'bg-gray-200';
    
    const statusOrder = ['new', 'in_review', 'approved', 'rejected'];
    const leadStatusIndex = statusOrder.indexOf(lead.status);
    const stepStatusIndex = statusOrder.indexOf(stepStatus);
    
    // Special case for rejected
    if (lead.status === 'rejected' && stepStatus !== 'rejected') {
      return stepStatusIndex < leadStatusIndex ? 'bg-brand' : 'bg-gray-200';
    }
    
    return stepStatusIndex <= leadStatusIndex ? 'bg-brand' : 'bg-gray-200';
  };
  
  if (loading) {
    return (
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
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
        <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/leads" className="btn btn-primary">
          Back to Leads
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/leads" className="mr-4 text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lead.name}</h1>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 mr-2">Lead ID: {lead.id}</span>
              {getStatusBadge(lead.status)}
            </div>
          </div>
        </div>
        
        {lead.documents && lead.documents.length > 0 && (
          <button
            onClick={downloadDocuments}
            disabled={downloading}
            className="btn btn-secondary"
          >
            {downloading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" 
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
                Downloading...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Download Documents
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{lead.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="mt-1 text-sm text-gray-900">{lead.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                      <p className="mt-1 text-sm text-gray-900">{lead.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p className="mt-1 text-sm text-gray-900">{lead.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Loan Amount</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(lead.loanAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-500">Affiliate</h3>
                      <p className="mt-1 text-sm text-gray-900">{lead.affiliateName}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {lead.notes && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Documents */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </div>
            <div className="card-body">
              {lead.documents && lead.documents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {lead.documents.map((doc) => (
                    <li key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.fileSize)} &bull; Uploaded on {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:text-brand-700 text-sm font-medium flex items-center"
                      >
                        <Download size={16} className="mr-1" />
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No documents uploaded for this lead</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Comments</h2>
            </div>
            <div className="card-body">
              {lead.comments && lead.comments.length > 0 ? (
                <ul className="space-y-4">
                  {lead.comments.map((comment) => (
                    <li key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{comment.createdByName}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No comments yet</p>
                </div>
              )}
              
              {/* Comment form */}
              {(user?.role === 'company_admin') && (
                <form onSubmit={addComment} className="mt-6">
                  <div className="mb-3">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Add a comment
                    </label>
                    <textarea
                      id="comment"
                      rows={3}
                      className="input"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your comment here..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment || !comment.trim()}
                    className="btn btn-primary"
                  >
                    {submittingComment ? (
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
                        Submitting...
                      </>
                    ) : (
                      'Add Comment'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Status Actions */}
          {user?.role === 'company_admin' && (
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">Update Status</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button
                    onClick={() => updateStatus('new')}
                    disabled={changingStatus || lead.status === 'new'}
                    className={`btn w-full justify-start ${
                      lead.status === 'new' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'btn-secondary'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    Mark as New
                  </button>
                  
                  <button
                    onClick={() => updateStatus('in_review')}
                    disabled={changingStatus || lead.status === 'in_review'}
                    className={`btn w-full justify-start ${
                      lead.status === 'in_review' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'btn-secondary'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    Mark as In Review
                  </button>
                  
                  <button
                    onClick={() => updateStatus('approved')}
                    disabled={changingStatus || lead.status === 'approved'}
                    className={`btn w-full justify-start ${
                      lead.status === 'approved' ? 'bg-green-50 text-green-800 border border-green-200' : 'btn-secondary'
                    }`}
                  >
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    Mark as Approved
                  </button>
                  
                  <button
                    onClick={() => updateStatus('rejected')}
                    disabled={changingStatus || lead.status === 'rejected'}
                    className={`btn w-full justify-start ${
                      lead.status === 'rejected' ? 'bg-red-50 text-red-800 border border-red-200' : 'btn-secondary'
                    }`}
                  >
                    <XCircle size={16} className="mr-2 text-red-500" />
                    Mark as Rejected
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Status Progress */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Status Progress</h2>
            </div>
            <div className="card-body">
              <div className="relative">
                {/* Progress bar */}
                <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
                  <div 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand" 
                    style={{ 
                      width: 
                        lead.status === 'new' ? '25%' :
                        lead.status === 'in_review' ? '50%' :
                        lead.status === 'approved' ? '100%' :
                        lead.status === 'rejected' ? '75%' : '0%'
                    }}
                  />
                </div>
                
                {/* Status steps */}
                <div className="relative flex items-center justify-between">
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${getStatusStepClass('new')}`}>
                      <span className="text-white text-xs">1</span>
                    </div>
                    <div className="text-xs mt-1">New</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${getStatusStepClass('in_review')}`}>
                      <span className="text-white text-xs">2</span>
                    </div>
                    <div className="text-xs mt-1">In Review</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${lead.status === 'rejected' ? getStatusStepClass('rejected') : 'bg-gray-200'}`}>
                      <span className="text-white text-xs">3</span>
                    </div>
                    <div className="text-xs mt-1">Rejected</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${lead.status === 'approved' ? getStatusStepClass('approved') : 'bg-gray-200'}`}>
                      <span className="text-white text-xs">4</span>
                    </div>
                    <div className="text-xs mt-1">Approved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status History */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Status History</h2>
            </div>
            <div className="card-body p-0">
              <ul className="divide-y divide-gray-200">
                {lead.statusHistory && lead.statusHistory.length > 0 ? (
                  lead.statusHistory.map((history) => (
                    <li key={history.id} className="px-4 py-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {history.status === 'new' && 'Marked as New'}
                          {history.status === 'in_review' && 'Marked as In Review'}
                          {history.status === 'approved' && 'Approved'}
                          {history.status === 'rejected' && 'Rejected'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(history.changedAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500">by {history.changedByName}</p>
                      {history.notes && (
                        <p className="mt-1 text-sm text-gray-600">{history.notes}</p>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-center text-gray-500">
                    No status history available
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;
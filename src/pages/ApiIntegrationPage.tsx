import React, { useState } from 'react';
import { Key, Copy, Trash2, Plus, ChevronDown, ChevronRight, Terminal, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST';
  endpoint: string;
  requestExample: string;
  responseExample: string;
}

// Mock data
const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_123456789abcdef',
    status: 'active',
    createdAt: '2024-03-15T10:00:00Z',
    lastUsed: '2024-03-16T15:30:00Z'
  },
  {
    id: '2',
    name: 'Test API Key',
    key: 'sk_test_987654321zyxwvu',
    status: 'inactive',
    createdAt: '2024-03-10T08:00:00Z',
    lastUsed: '2024-03-12T11:45:00Z'
  }
];

const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'single-upload',
    name: 'Upload Single Lead',
    description: 'Upload a single lead to the system with all required information.',
    method: 'POST',
    endpoint: '/api/v1/leads',
    requestExample: `curl -X POST https://api.leadflow.com/v1/leads \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "loanAmount": 25000,
    "address": "123 Main St, City, Country"
  }'`,
    responseExample: `{
  "id": "lead_123abc",
  "status": "new",
  "createdAt": "2024-03-16T10:30:00Z",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "loanAmount": 25000,
  "address": "123 Main St, City, Country"
}`
  },
  {
    id: 'bulk-upload',
    name: 'Bulk Upload Leads',
    description: 'Upload multiple leads at once using a CSV file.',
    method: 'POST',
    endpoint: '/api/v1/leads/bulk',
    requestExample: `curl -X POST https://api.leadflow.com/v1/leads/bulk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@leads.csv"`,
    responseExample: `{
  "status": "success",
  "totalProcessed": 100,
  "successCount": 98,
  "failureCount": 2,
  "errors": [
    {
      "row": 45,
      "error": "Invalid email format"
    },
    {
      "row": 72,
      "error": "Missing required field: phone"
    }
  ]
}`
  },
  {
    id: 'get-status',
    name: 'Get Lead Status',
    description: 'Retrieve the current status of a lead by its ID.',
    method: 'GET',
    endpoint: '/api/v1/leads/:id/status',
    requestExample: `curl https://api.leadflow.com/v1/leads/lead_123abc/status \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    responseExample: `{
  "id": "lead_123abc",
  "status": "in_review",
  "lastUpdated": "2024-03-16T15:45:00Z",
  "statusHistory": [
    {
      "status": "new",
      "timestamp": "2024-03-16T10:30:00Z"
    },
    {
      "status": "in_review",
      "timestamp": "2024-03-16T15:45:00Z"
    }
  ]
}`
  }
];

const ApiIntegrationPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const copyToClipboard = (text: string, message: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };
  
  const createApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }
    
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    setApiKeys([newKey, ...apiKeys]);
    setShowNewKeyModal(false);
    setNewKeyName('');
    toast.success('API key created successfully');
  };
  
  const toggleKeyStatus = (keyId: string) => {
    setApiKeys(apiKeys.map(key => {
      if (key.id === keyId) {
        return {
          ...key,
          status: key.status === 'active' ? 'inactive' : 'active'
        };
      }
      return key;
    }));
    
    toast.success('API key status updated');
  };
  
  const deleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast.success('API key deleted');
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">API Integration</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your API keys and explore available endpoints
        </p>
      </div>
      
      {/* API Keys Section */}
      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Create API Key
          </button>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{key.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {key.key.substring(0, 8)}•••••••••••••
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.lastUsed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleKeyStatus(key.id)}
                        className={`mr-2 ${
                          key.status === 'active'
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {key.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* API Documentation Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">API Documentation</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Endpoints List */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Available Endpoints</h3>
              <div className="space-y-2">
                {apiEndpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedEndpoint === endpoint.id
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Terminal size={16} className="mr-2" />
                        <span className="font-medium">{endpoint.name}</span>
                      </div>
                      {selectedEndpoint === endpoint.id ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Endpoint Details */}
            <div className="lg:col-span-2">
              {selectedEndpoint ? (
                <div>
                  {apiEndpoints.map((endpoint) => {
                    if (endpoint.id !== selectedEndpoint) return null;
                    
                    return (
                      <div key={endpoint.id}>
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{endpoint.name}</h3>
                          <p className="text-gray-600">{endpoint.description}</p>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Endpoint</h4>
                            <button
                              onClick={() => copyToClipboard(endpoint.endpoint)}
                              className="text-sm text-brand hover:text-brand-700"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-4 flex items-center">
                            <span className={`text-sm mr-2 ${
                              endpoint.method === 'GET' ? 'text-blue-400' : 'text-green-400'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-gray-200">{endpoint.endpoint}</code>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Request Example</h4>
                            <button
                              onClick={() => copyToClipboard(endpoint.requestExample)}
                              className="text-sm text-brand hover:text-brand-700"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="bg-gray-800 rounded-lg overflow-hidden">
                            <SyntaxHighlighter
                              language="bash"
                              style={atomOneDark}
                              customStyle={{
                                padding: '1rem',
                                margin: 0,
                                borderRadius: '0.5rem'
                              }}
                            >
                              {endpoint.requestExample}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Response Example</h4>
                            <button
                              onClick={() => copyToClipboard(endpoint.responseExample)}
                              className="text-sm text-brand hover:text-brand-700"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <div className="bg-gray-800 rounded-lg overflow-hidden">
                            <SyntaxHighlighter
                              language="json"
                              style={atomOneDark}
                              customStyle={{
                                padding: '1rem',
                                margin: 0,
                                borderRadius: '0.5rem'
                              }}
                            >
                              {endpoint.responseExample}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                  <Terminal size={48} className="mb-4" />
                  <p>Select an endpoint to view its documentation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New API Key</h3>
            </div>
            <div className="px-6 py-4">
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                API Key Name
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="input mb-4"
              />
              <p className="text-sm text-gray-500 mb-4">
                Give your API key a memorable name to help you identify its use.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="btn btn-primary"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationPage;
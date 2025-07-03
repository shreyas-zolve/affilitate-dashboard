import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Link as LinkIcon, Copy, QrCode, Download, History, 
  ExternalLink, Trash2, RefreshCw, Calendar, Filter, Plus, ArrowLeft 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface LinkFormData {
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  enableShortening: boolean;
  customAlias?: string;
}

interface GeneratedLink {
  id: string;
  originalUrl: string;
  shortUrl?: string;
  utmParameters: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  };
  clicks: number;
  createdAt: string;
  lastClickedAt?: string;
}

// Mock data for demonstration
const mockHistory: GeneratedLink[] = [
  {
    id: '1',
    originalUrl: 'https://example.com/signup?utm_source=affiliate1&utm_medium=referral&utm_campaign=spring2024',
    shortUrl: 'https://short.ly/abc123',
    utmParameters: {
      source: 'affiliate1',
      medium: 'referral',
      campaign: 'spring2024'
    },
    clicks: 45,
    createdAt: '2024-03-15T10:30:00Z',
    lastClickedAt: '2024-03-16T14:22:00Z'
  },
  {
    id: '2',
    originalUrl: 'https://example.com/signup?utm_source=affiliate2&utm_medium=social&utm_campaign=winter2024',
    shortUrl: 'https://short.ly/def456',
    utmParameters: {
      source: 'affiliate2',
      medium: 'social',
      campaign: 'winter2024'
    },
    clicks: 23,
    createdAt: '2024-03-14T09:15:00Z',
    lastClickedAt: '2024-03-15T16:45:00Z'
  },
  {
    id: '3',
    originalUrl: 'https://example.com/signup?utm_source=affiliate3&utm_medium=email&utm_campaign=newsletter',
    utmParameters: {
      source: 'affiliate3',
      medium: 'email',
      campaign: 'newsletter'
    },
    clicks: 12,
    createdAt: '2024-03-13T15:20:00Z',
    lastClickedAt: '2024-03-14T10:30:00Z'
  }
];

const baseDomains = [
  'https://example.com',
  'https://signup.example.com',
  'https://app.example.com',
  'https://portal.example.com'
];

const LinkGeneratorPage: React.FC = () => {
  const [showLinkGenerationForm, setShowLinkGenerationForm] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [linkHistory, setLinkHistory] = useState<GeneratedLink[]>(mockHistory);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const { 
    register, 
    handleSubmit, 
    watch,
    reset,
    formState: { errors } 
  } = useForm<LinkFormData>({
    defaultValues: {
      baseUrl: baseDomains[0],
      enableShortening: true
    }
  });

  const watchEnableShortening = watch('enableShortening');

  const onSubmit = async (data: LinkFormData) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Build UTM parameters
      const utmParams = new URLSearchParams();
      utmParams.append('utm_source', data.utmSource);
      utmParams.append('utm_medium', data.utmMedium);
      utmParams.append('utm_campaign', data.utmCampaign);
      
      if (data.utmTerm) {
        utmParams.append('utm_term', data.utmTerm);
      }
      
      if (data.utmContent) {
        utmParams.append('utm_content', data.utmContent);
      }
      
      // Generate the full URL
      const fullUrl = `${data.baseUrl}?${utmParams.toString()}`;
      
      // Mock shortened URL if enabled
      const finalUrl = data.enableShortening 
        ? `https://short.ly/${Math.random().toString(36).substring(2, 8)}`
        : fullUrl;
      
      setGeneratedLink(finalUrl);
      setShowQRCode(true);
      
      // Add to history
      const newHistoryItem: GeneratedLink = {
        id: `link_${Date.now()}`,
        originalUrl: fullUrl,
        shortUrl: data.enableShortening ? finalUrl : undefined,
        utmParameters: {
          source: data.utmSource,
          medium: data.utmMedium,
          campaign: data.utmCampaign,
          term: data.utmTerm,
          content: data.utmContent
        },
        clicks: 0,
        createdAt: new Date().toISOString()
      };
      
      setLinkHistory(prev => [newHistoryItem, ...prev]);
      
      toast.success('Link generated successfully!');
      
      // No automatic redirection - user stays on form page
    } catch (error) {
      toast.error('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const downloadQRCode = () => {
    const svg = document.querySelector('#qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('QR code downloaded!');
  };

  const deleteLink = (id: string) => {
    setLinkHistory(prev => prev.filter(link => link.id !== id));
    toast.success('Link deleted from history');
  };

  const clearHistory = () => {
    setLinkHistory([]);
    toast.success('History cleared');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetForm = () => {
    reset();
    setGeneratedLink('');
    setShowQRCode(false);
  };

  const handleBackToHistory = () => {
    setShowLinkGenerationForm(false);
    resetForm();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Link Generator</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate trackable links with UTM parameters and QR codes for your campaigns
        </p>
      </div>

      {!showLinkGenerationForm ? (
        // History View with Generate New Link Button
        <>
          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowLinkGenerationForm(true)}
              className="btn btn-primary"
            >
              <Plus size={20} className="mr-2" />
              Generate New Link
            </button>
          </div>

          {/* Link History */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <div className="flex items-center">
                <History size={20} className="mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Link History</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-secondary"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </button>
                <button
                  onClick={clearHistory}
                  className="btn btn-danger"
                  disabled={linkHistory.length === 0}
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear History
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              </div>
            )}

            <div className="card-body p-0">
              {linkHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          UTM Parameters
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {linkHistory.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {link.shortUrl || link.originalUrl}
                              </div>
                              {link.shortUrl && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {link.originalUrl}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div>Source: {link.utmParameters.source}</div>
                              <div>Medium: {link.utmParameters.medium}</div>
                              <div>Campaign: {link.utmParameters.campaign}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(link.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => copyToClipboard(link.shortUrl || link.originalUrl)}
                                className="text-brand hover:text-brand-700"
                                title="Copy link"
                              >
                                <Copy size={16} />
                              </button>
                              <a
                                href={link.shortUrl || link.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                                title="Open link"
                              >
                                <ExternalLink size={16} />
                              </a>
                              <button
                                onClick={() => deleteLink(link.id)}
                                className="text-red-400 hover:text-red-600"
                                title="Delete link"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No links generated yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate your first link to start tracking your campaigns.
                  </p>
                  <button
                    onClick={() => setShowLinkGenerationForm(true)}
                    className="btn btn-primary"
                  >
                    <Plus size={16} className="mr-2" />
                    Generate Your First Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Link Generation Form View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Link Generation Form */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="card-header">
                {/* Integrated back navigation with title */}
                <div className="flex items-center">
                  <button
                    onClick={handleBackToHistory}
                    className="mr-3 text-gray-500 hover:text-gray-900 transition-colors"
                    title="Back to History"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-medium text-gray-900">Generate New Link</h2>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Base URL Selection */}
                  <div>
                    <label htmlFor="baseUrl" className="label">
                      Base Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="baseUrl"
                      className={`input ${errors.baseUrl ? 'border-red-500' : ''}`}
                      {...register('baseUrl', { required: 'Base URL is required' })}
                    >
                      {baseDomains.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                    {errors.baseUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.baseUrl.message}</p>
                    )}
                  </div>

                  {/* UTM Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="utmSource" className="label">
                        UTM Source <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="utmSource"
                        type="text"
                        placeholder="e.g., affiliate_name"
                        className={`input ${errors.utmSource ? 'border-red-500' : ''}`}
                        {...register('utmSource', { required: 'UTM Source is required' })}
                      />
                      {errors.utmSource && (
                        <p className="mt-1 text-sm text-red-600">{errors.utmSource.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="utmMedium" className="label">
                        UTM Medium <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="utmMedium"
                        type="text"
                        placeholder="e.g., referral, social, email"
                        className={`input ${errors.utmMedium ? 'border-red-500' : ''}`}
                        {...register('utmMedium', { required: 'UTM Medium is required' })}
                      />
                      {errors.utmMedium && (
                        <p className="mt-1 text-sm text-red-600">{errors.utmMedium.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="utmCampaign" className="label">
                        UTM Campaign <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="utmCampaign"
                        type="text"
                        placeholder="e.g., spring_2024"
                        className={`input ${errors.utmCampaign ? 'border-red-500' : ''}`}
                        {...register('utmCampaign', { required: 'UTM Campaign is required' })}
                      />
                      {errors.utmCampaign && (
                        <p className="mt-1 text-sm text-red-600">{errors.utmCampaign.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="utmTerm" className="label">
                        UTM Term <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        id="utmTerm"
                        type="text"
                        placeholder="e.g., credit_card"
                        className="input"
                        {...register('utmTerm')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="utmContent" className="label">
                        UTM Content <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        id="utmContent"
                        type="text"
                        placeholder="e.g., banner_ad, text_link"
                        className="input"
                        {...register('utmContent')}
                      />
                    </div>
                  </div>

                  {/* Link Shortening Options - Inline with other fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="label mb-0">
                          Shorten Link
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            {...register('enableShortening')}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Create a shortened version of your link</p>
                    </div>

                    {watchEnableShortening && (
                      <div>
                        <label htmlFor="customAlias" className="label">
                          Custom Alias <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            short.ly/
                          </span>
                          <input
                            id="customAlias"
                            type="text"
                            placeholder="custom-alias"
                            className="input rounded-l-none"
                            {...register('customAlias', {
                              pattern: {
                                value: /^[a-zA-Z0-9-_]+$/,
                                message: 'Only letters, numbers, hyphens, and underscores allowed'
                              }
                            })}
                          />
                        </div>
                        {errors.customAlias && (
                          <p className="mt-1 text-sm text-red-600">{errors.customAlias.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? (
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
                          Generating...
                        </>
                      ) : (
                        <>
                          <LinkIcon size={16} className="mr-2" />
                          Generate Link
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-secondary"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Reset Form
                    </button>
                  </div>

                  {/* Generated Link Display */}
                  {generatedLink && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Generated Link</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <code className="text-sm text-gray-800 break-all">{generatedLink}</code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(generatedLink)}
                            className="btn btn-secondary ml-3"
                          >
                            <Copy size={16} className="mr-2" />
                            Copy
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowQRCode(!showQRCode)}
                            className="btn btn-secondary"
                          >
                            <QrCode size={16} className="mr-2" />
                            {showQRCode ? 'Hide' : 'Show'} QR Code
                          </button>
                          
                          <a
                            href={generatedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                          >
                            <ExternalLink size={16} className="mr-2" />
                            Test Link
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div>
            {showQRCode && generatedLink && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">QR Code</h2>
                </div>
                <div className="card-body text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border">
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={generatedLink}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={downloadQRCode}
                      className="btn btn-secondary"
                    >
                      <Download size={16} className="mr-2" />
                      Download PNG
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkGeneratorPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../services/leadService';

const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    count: number;
    errors?: string[];
  } | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      const result = await leadService.uploadBulkLeads(selectedFile);
      
      setUploadResult({
        success: !result.errors || result.errors.length === 0,
        count: result.count,
        errors: result.errors
      });
      
      if (!result.errors || result.errors.length === 0) {
        toast.success(`Successfully uploaded ${result.count} leads`);
      } else {
        toast.error(`Uploaded with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error('Error uploading leads:', error);
      toast.error('Failed to upload leads. Please check your file format and try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const downloadTemplate = async () => {
    setDownloadingTemplate(true);
    
    try {
      const blob = await leadService.downloadCsvTemplate();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'lead-template.csv';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };
  
  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Bulk Lead Upload</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload multiple leads at once using a CSV file
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Upload CSV File</h2>
            </div>
            <div className="card-body">
              <div className="mb-6">
                <label className="label">
                  CSV File <span className="text-red-500">*</span>
                </label>
                
                {!selectedFile ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="csv-upload" className="relative cursor-pointer rounded-md font-medium text-brand hover:text-brand-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500">
                          <span>Upload a file</span>
                          <input
                            id="csv-upload"
                            name="csv-upload"
                            type="file"
                            className="sr-only"
                            accept=".csv"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        CSV file up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between p-4 border border-gray-300 rounded-md">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-10 w-10 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedFile.size < 1024 * 1024
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="btn btn-primary"
                >
                  {uploading ? (
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
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload Leads
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={downloadTemplate}
                  disabled={downloadingTemplate}
                  className="btn btn-secondary"
                >
                  {downloadingTemplate ? (
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
                      Download Template
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/leads')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
              
              {/* Upload Result */}
              {uploadResult && (
                <div className={`mt-6 p-4 rounded-md ${uploadResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {uploadResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {uploadResult.success 
                          ? `Successfully uploaded ${uploadResult.count} leads` 
                          : 'Upload completed with errors'
                        }
                      </h3>
                      
                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {uploadResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {uploadResult.success && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => navigate('/leads')}
                            className="text-sm font-medium text-green-600 hover:text-green-500"
                          >
                            View all leads
                          </button>
                        </div>
                      )}
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
              <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
            </div>
            <div className="card-body">
              <ol className="space-y-4 text-sm">
                <li className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-medium mr-2">1</span>
                  <span>Download the CSV template using the button below</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-medium mr-2">2</span>
                  <span>Fill in the template with your lead information</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-medium mr-2">3</span>
                  <span>Save the file as a CSV</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-medium mr-2">4</span>
                  <span>Upload the completed CSV file</span>
                </li>
              </ol>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Required Fields</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="text-red-500 mr-2">*</span>
                    <span>Name</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-500 mr-2">*</span>
                    <span>Email</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-500 mr-2">*</span>
                    <span>Phone</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-500 mr-2">*</span>
                    <span>Loan Amount</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Optional Fields</h3>
                <ul className="space-y-1 text-sm">
                  <li>Address</li>
                  <li>Notes</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Make sure all required fields are filled</li>
                        <li>Do not modify the header row in the CSV</li>
                        <li>Maximum file size is 10MB</li>
                        <li>For document uploads, add leads individually</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPage;
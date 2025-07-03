import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Upload, X, FileText, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService, { LeadFormData } from '../services/leadService';

interface DocumentType {
  id: string;
  name: string;
  required: boolean;
  description: string;
}

interface Service {
  id: string;
  name: string;
}

const services: Service[] = [
  { id: 'credit_card', name: 'Credit Card' },
  { id: 'checking_account', name: 'Checking Account' },
  { id: 'forex_card', name: 'Forex Card' },
  { id: 'auto_loan', name: 'Auto Loan' },
  { id: 'sim_card', name: 'Sim Card' },
  { id: 'health_insurance', name: 'Health Insurance' },
  { id: 'renters_insurance', name: "Renter's Insurance" },
  { id: 'auto_insurance', name: 'Auto Insurance' },
  { id: 'visa_webinar', name: 'VISA Webinar' },
  { id: 'visa_slot_alerts', name: 'VISA slot alerts' }
];

const documentTypes: DocumentType[] = [
  {
    id: 'passport',
    name: 'Passport',
    required: true,
    description: 'Valid passport with at least 6 months validity'
  },
  {
    id: 'visa',
    name: 'Visa',
    required: true,
    description: 'Current valid visa'
  },
  {
    id: 'i20',
    name: 'I-20 Form',
    required: true,
    description: 'Most recent I-20 form'
  },
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    required: true,
    description: 'Last 3 months of bank statements'
  },
  {
    id: 'enrollment_proof',
    name: 'Proof of Enrollment',
    required: false,
    description: 'Current semester enrollment verification'
  }
];

const SingleLeadFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors } 
  } = useForm<LeadFormData>();
  
  const handleFileChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFileErrors(prev => ({ ...prev, [docType]: '' }));
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({
        ...prev,
        [docType]: 'File size must be less than 5MB'
      }));
      return;
    }
    
    // Check file type
    const fileType = file.type.toLowerCase();
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(fileType)) {
      setFileErrors(prev => ({
        ...prev,
        [docType]: 'Only PDF, JPG, and PNG files are allowed'
      }));
      return;
    }
    
    setSelectedFiles(prev => ({
      ...prev,
      [docType]: file
    }));
  };
  
  const removeFile = (docType: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [docType]: null
    }));
    setFileErrors(prev => ({
      ...prev,
      [docType]: ''
    }));
  };
  
  const validateDocuments = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    
    documentTypes.forEach(doc => {
      if (doc.required && !selectedFiles[doc.id]) {
        newErrors[doc.id] = `${doc.name} is required`;
        isValid = false;
      }
    });
    
    setFileErrors(newErrors);
    return isValid;
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const toggleAllServices = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(service => service.id));
    }
  };
  
  const onSubmit = async (data: LeadFormData) => {
    if (!validateDocuments()) {
      toast.error('Please upload all required documents');
      return;
    }

    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    
    // Add files and services to form data
    data.documents = Object.entries(selectedFiles)
      .filter(([_, file]) => file !== null)
      .map(([docType, file]) => ({
        type: docType,
        file: file as File
      }));
    
    data.services = selectedServices;
    
    setSubmitting(true);
    
    try {
      const newLead = await leadService.createLead(data);
      toast.success('Lead created successfully!');
      navigate(`/leads/${newLead.id}`);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Lead</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the details below to add a new lead to the system
        </p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className={`input ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="label">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`input ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\d\s\+\-\(\)]{10,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              {/* Loan Amount */}
              <div>
                <label htmlFor="loanAmount" className="label">
                  Loan Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Controller
                    name="loanAmount"
                    control={control}
                    rules={{ 
                      required: 'Loan amount is required',
                      min: {
                        value: 1000,
                        message: 'Minimum loan amount is $1,000'
                      },
                      max: {
                        value: 1000000,
                        message: 'Maximum loan amount is $1,000,000'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        type="number"
                        className={`input pl-8 ${errors.loanAmount ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="0.00"
                        min="1000"
                        step="100"
                        {...field}
                      />
                    )}
                  />
                </div>
                {errors.loanAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanAmount.message}</p>
                )}
              </div>
              
              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="label">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  className="input"
                  {...register('address')}
                />
              </div>

              {/* Services Interested In */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">
                    Services Interested In <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllServices}
                    className="text-sm text-brand hover:text-brand-700 font-medium flex items-center"
                  >
                    <CheckSquare size={16} className="mr-1" />
                    {selectedServices.length === services.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedServices.includes(service.id)
                          ? 'border-brand bg-brand-50 text-brand-700'
                          : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="h-4 w-4 text-brand border-gray-300 rounded focus:ring-brand"
                        />
                        <label className="ml-2 block text-sm font-medium">
                          {service.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedServices.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">Please select at least one service</p>
                )}
              </div>
              
              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  className="input"
                  {...register('notes')}
                />
              </div>
            </div>
            
            {/* Document Upload */}
            <div className="mb-6">
              <label className="label">
                Required Documents
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentTypes.map((docType) => (
                  <div
                    key={docType.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {docType.name}
                          {docType.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <p className="text-xs text-gray-500">{docType.description}</p>
                      </div>
                    </div>
                    
                    {!selectedFiles[docType.id] ? (
                      <div className="mt-2">
                        <label
                          htmlFor={`file-${docType.id}`}
                          className="flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-brand-500 transition-colors"
                        >
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <span className="relative font-medium text-brand hover:text-brand-700">
                                Upload file
                                <input
                                  id={`file-${docType.id}`}
                                  type="file"
                                  className="sr-only"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(docType.id, e)}
                                />
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, JPG, PNG up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {selectedFiles[docType.id]?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedFiles[docType.id]?.size < 1024 * 1024
                                ? `${(selectedFiles[docType.id]?.size! / 1024).toFixed(1)} KB`
                                : `${(selectedFiles[docType.id]?.size! / (1024 * 1024)).toFixed(1)} MB`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(docType.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    
                    {fileErrors[docType.id] && (
                      <p className="mt-1 text-sm text-red-600">{fileErrors[docType.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/leads')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
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
                    Saving...
                  </>
                ) : (
                  'Save Lead'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SingleLeadFormPage;

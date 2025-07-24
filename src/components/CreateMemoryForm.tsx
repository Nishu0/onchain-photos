"use client";

import React, { useState, useRef } from 'react';
import { useAccount } from "wagmi";
import WalletConnector from './wallet-connector';
import CameraCapture from './CameraCapture';

interface CreateMemoryFormProps {
  onClose: () => void;
  user: {
    id: string;
    wallet_address: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface UploadedFile {
  url: string;
  cid: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  file: File;
}

export default function CreateMemoryForm({ onClose, user }: CreateMemoryFormProps) {
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owners, setOwners] = useState([address || '']);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [uploadMode, setUploadMode] = useState<'device' | 'camera'>('device');
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addOwner = () => {
    setOwners([...owners, '']);
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      setOwners(owners.filter((_, i) => i !== index));
    }
  };

  const updateOwner = (index: number, value: string) => {
    const newOwners = [...owners];
    newOwners[index] = value;
    setOwners(newOwners);
  };

  const uploadToPinata = async (file: File): Promise<UploadedFile | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          cid: data.cid,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          file: file
        };
      } else {
        console.error('Failed to upload file');
        return null;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      
      for (const file of Array.from(files)) {
        const uploadedFile = await uploadToPinata(file);
        if (uploadedFile) {
          setSelectedFiles(prev => [...prev, uploadedFile]);
        }
      }
      
      setIsUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      
      for (const file of Array.from(files)) {
        const uploadedFile = await uploadToPinata(file);
        if (uploadedFile) {
          setSelectedFiles(prev => [...prev, uploadedFile]);
        }
      }
      
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const openFileSelector = () => {
    if (uploadMode === 'device') {
      fileInputRef.current?.click();
    } else {
      setShowCamera(true);
    }
  };

  const handleCameraCapture = async (file: File) => {
    setShowCamera(false);
    setIsUploading(true);
    
    const uploadedFile = await uploadToPinata(file);
    if (uploadedFile) {
      setSelectedFiles(prev => [...prev, uploadedFile]);
    }
    
    setIsUploading(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !user || selectedFiles.length === 0) {
      alert('Please fill in the title and upload at least one photo');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = {
        title,
        description,
        created_by: user.id,
        owners: owners.filter(owner => owner.trim() !== ''),
        photos: selectedFiles.map(file => ({
          url: file.url,
          cid: file.cid,
          fileName: file.fileName,
          fileSize: file.fileSize,
          mimeType: file.mimeType
        }))
      };

      const response = await fetch('/api/memory-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Memory form created:', data.form);
        alert('Memory minted successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Failed to create memory form:', errorData);
        alert('Failed to mint memory. Please try again.');
      }
    } catch (error) {
      console.error('Error creating memory form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="flex w-full min-h-screen bg-cover bg-center flex-col items-center px-4 md:px-6" style={{backgroundImage: "url('/herobg.svg')"}}>
        {/* Navigation */}
        <nav className="flex px-4 py-6 md:px-8 lg:px-16 w-full max-w-7xl mx-auto justify-between items-center z-10">
          <h1 className="m-0 font-bold text-lg md:text-xl lg:text-3xl bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent font-montserrat">
            Memories on Chain
          </h1>
          <WalletConnector />
        </nav>

        {/* Form Container */}
        <div className="flex flex-col mt-4 md:mt-8 w-full max-w-6xl mx-auto bg-white border-2 border-purple-500 shadow-2xl rounded-2xl mb-8 md:mb-12 overflow-hidden">
          {/* Title Bar */}
          <div className="flex w-full justify-between items-center px-6 md:px-12 py-4 md:py-5 bg-purple-100">
            <p className="m-0 font-semibold text-base md:text-lg lg:text-xl text-gray-800">
              let&apos;s mint some beautiful memories on chain
            </p>
            <button 
              onClick={onClose}
              className="w-6 h-6 md:w-8 md:h-8 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row h-full items-stretch">
            {/* File Drop Area */}
            <div className="w-full lg:w-1/2 p-6 md:p-8">
              {/* Upload Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setUploadMode('device')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === 'device' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📁 Upload from Device
                </button>
                <button
                  onClick={() => setUploadMode('camera')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === 'camera' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📷 Capture from Camera
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              <div 
                onClick={openFileSelector}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex w-full min-h-48 lg:min-h-80 border-2 border-dashed border-blue-400 rounded-xl items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="text-center p-6 md:p-8">
                  {isUploading ? (
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-blue-600 mb-2 font-medium">Uploading to Pinata...</p>
                    </div>
                  ) : selectedFiles.length > 0 ? (
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                      </div>
                      <p className="text-green-600 mb-2 font-medium">{selectedFiles.length} file(s) uploaded</p>
                      <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between mb-1 p-2 bg-white rounded border">
                            <span className="truncate flex-1">{file.fileName}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="ml-2 w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Click to {uploadMode === 'device' ? 'select more files' : 'take another photo'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        {uploadMode === 'device' ? (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 font-medium">
                        {uploadMode === 'device' 
                          ? 'Drop your memory files here' 
                          : 'Take photos for your memories'
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        {uploadMode === 'device' 
                          ? 'or click to browse images' 
                          : 'or click to open camera'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col w-full lg:w-1/2 p-6 md:p-8">
              {/* Title Input */}
              <label className="mb-6">
                <p className="font-medium text-base mb-3 text-gray-700">Title *</p>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-purple-400 rounded-lg h-12 w-full font-medium text-base px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter memory title"
                  required
                />
              </label>

              {/* Description Input */}
              <label className="mb-6">
                <p className="font-medium text-base mb-3 text-gray-700">Description</p>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border border-purple-400 rounded-lg w-full font-medium text-base p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your memory"
                />
              </label>

              {/* Wallet Addresses */}
              <label className="mb-6">
                <p className="font-medium text-base mb-3 text-gray-700">Wallet Address(es)</p>
                
                {/* Owners List */}
                <div className="w-full border border-purple-400 rounded-xl overflow-hidden bg-purple-50 mb-4">
                  <div className="flex items-center px-4 h-10 bg-purple-200">
                    <p className="m-0 font-medium text-sm text-gray-800">Owners</p>
                  </div>
                  {owners.map((owner, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-3 border-t border-purple-200">
                      <input
                        type="text"
                        value={owner}
                        onChange={(e) => updateOwner(index, e.target.value)}
                        className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none mr-3"
                        placeholder="Enter wallet address"
                      />
                      {owners.length > 1 && (
                        <button 
                          onClick={() => removeOwner(index)}
                          className="w-6 h-6 hover:bg-red-200 bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add More Owner Button */}
                <button
                  onClick={addOwner}
                  className="flex w-full h-12 bg-purple-50 border border-purple-200 rounded-lg items-center justify-center hover:bg-purple-100 transition-colors mb-4"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <p className="m-0 text-sm font-medium text-gray-700">add more owners</p>
                </button>

                {/* CSV Upload */}
                <div className="flex w-full flex-col justify-center items-center">
                  <p className="mb-1 mt-3 font-medium text-sm text-gray-600">or</p>
                  <h3 className="font-medium text-sm m-0 text-gray-700">Upload CSV files</h3>
                  <div className="mt-1 flex w-44 h-px bg-purple-500"></div>
                </div>
              </label>

              {/* Submit Button */}
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading || !title || selectedFiles.length === 0}
                className="flex w-full h-12 items-center justify-center bg-purple-500 border-2 border-purple-500 rounded-full text-white font-semibold text-base hover:bg-purple-600 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Minting your memory...
                  </>
                ) : (
                  'mint your memory'
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
} 
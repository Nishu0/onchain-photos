"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from "wagmi";
import WalletConnector from './wallet-connector';

interface Photo {
  id: string;
  pinata_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface FormOwner {
  wallet_address: string;
  created_at: string;
}

interface User {
  id: string;
  wallet_address: string;
  created_at: string;
}

interface MemoryForm {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  photos: Photo[];
  form_owners: FormOwner[];
  users: User;
}

interface FeedProps {
  onClose: () => void;
}

export default function Feed({ onClose }: FeedProps) {
  const { address } = useAccount();
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [memoryForms, setMemoryForms] = useState<MemoryForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have an address or want to show all memories
    if (address) {
      console.log('useEffect triggered with address:', address);
      fetchMemoryForms();
    } else {
      console.log('No address available, setting empty forms');
      setMemoryForms([]);
      setIsLoading(false);
    }
  }, [address]);

  const fetchMemoryForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = `/api/memory-forms${address ? `?wallet_address=${address}` : ''}`;
      console.log('Fetching memory forms from:', url);
      console.log('Wallet address:', address);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        console.log('Forms array:', data.forms);
        console.log('Number of forms:', data.forms?.length || 0);
        
        setMemoryForms(data.forms || []);
      } else {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        setError('Failed to fetch memories');
      }
    } catch (error) {
      console.error('Error fetching memory forms:', error);
      setError('Error loading memories');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAllPhotos = () => {
    return memoryForms.flatMap(form => 
      form.photos.map(photo => ({
        ...photo,
        form: form
      }))
    );
  };

  const TimelineView = () => (
    <div className="space-y-8">
      {memoryForms.map((form) => (
        <div key={form.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{form.title}</h2>
                <p className="text-gray-600 mb-3">{form.description}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>📅 {formatDate(form.created_at)}</span>
                  <span>👤 {form.users.wallet_address.slice(0, 6)}...{form.users.wallet_address.slice(-4)}</span>
                  <span>📸 {form.photos.length} photo{form.photos.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {form.form_owners.length} owner{form.form_owners.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Photos */}
          {form.photos.length > 0 && (
            <div className="p-6">
              {form.photos.length === 1 ? (
                <div className="w-full">
                  <img
                    src={form.photos[0].pinata_url}
                    alt={form.photos[0].file_name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {form.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square">
                      <img
                        src={photo.pinata_url}
                        alt={photo.file_name}
                        className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Owners */}
          {form.form_owners.length > 1 && (
            <div className="px-6 pb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Shared with:</h4>
              <div className="flex flex-wrap gap-2">
                {form.form_owners.map((owner, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                  >
                    {owner.wallet_address.slice(0, 6)}...{owner.wallet_address.slice(-4)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const GridView = () => {
    const allPhotos = getAllPhotos();

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {allPhotos.map((photo, index) => (
          <div key={`${photo.id}-${index}`} className="group relative aspect-square">
            <img
              src={photo.pinata_url}
              alt={photo.file_name}
              className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
            />
            {/* Overlay with info */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 rounded-lg flex items-end">
              <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-sm font-medium truncate">{photo.form.title}</p>
                <p className="text-xs text-gray-300">{formatDate(photo.form.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800 font-montserrat">Memory Feed</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Debug Info */}
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'No wallet'}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={fetchMemoryForms}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh memories"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23,4 23,10 17,10"></polyline>
                  <polyline points="1,20 1,14 7,14"></polyline>
                  <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
                </svg>
              </button>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📰 Timeline
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🎛️ Grid
                </button>
              </div>
              
              <WalletConnector />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading memories...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load memories</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchMemoryForms}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : memoryForms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memories yet</h3>
            <p className="text-gray-600 mb-4">Create your first memory to see it here</p>
            <button
              onClick={onClose}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Memory
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">{memoryForms.length}</p>
                    <p className="text-gray-600">Total Memories</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">{getAllPhotos().length}</p>
                    <p className="text-gray-600">Total Photos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Set(memoryForms.flatMap(form => form.form_owners.map(owner => owner.wallet_address))).size}
                    </p>
                    <p className="text-gray-600">Unique Owners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Content */}
            {viewMode === 'timeline' ? <TimelineView /> : <GridView />}
          </>
        )}
      </main>
    </div>
  );
} 
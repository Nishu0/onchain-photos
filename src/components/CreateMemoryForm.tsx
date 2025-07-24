"use client";

import React, { useState } from 'react';
import WalletConnector from './wallet-connector';

interface CreateMemoryFormProps {
  onClose: () => void;
}

export default function CreateMemoryForm({ onClose }: CreateMemoryFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owners, setOwners] = useState(['8eUwwhynpeJFFSpcbi7TCNUM4hyrEptZANLRHZba33Ln']);

  const addOwner = () => {
    setOwners([...owners, '']);
  };

  const removeOwner = (index: number) => {
    setOwners(owners.filter((_, i) => i !== index));
  };

  const updateOwner = (index: number, value: string) => {
    const newOwners = [...owners];
    newOwners[index] = value;
    setOwners(newOwners);
  };

  return (
    <section className="flex w-full min-h-screen bg-cover bg-center flex-col items-center" style={{backgroundImage: "url('/herobg.svg')"}}>
      {/* Navigation */}
      <nav className="flex px-4 py-6 md:px-16 md:py-8 w-full max-w-7xl mx-auto justify-between items-center z-10">
        <h1 className="m-0 font-bold text-xl md:text-3xl bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent font-montserrat">
          Memories on Chain
        </h1>
        <WalletConnector />
      </nav>

      {/* Form Container */}
      <div className="flex flex-col mt-4 md:mt-8 w-full max-w-6xl mx-4 md:mx-auto bg-white border-2 border-purple-500 shadow-2xl rounded-2xl mb-8 md:mb-12 overflow-hidden">
        {/* Title Bar */}
        <div className="flex w-full justify-between items-center px-4 md:px-12 py-4 md:py-5 bg-purple-100">
          <p className="m-0 font-semibold text-lg md:text-xl text-gray-800">
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
          <div className="flex w-full lg:w-1/2 min-h-48 lg:min-h-96 border-2 border-dashed border-blue-400 rounded-xl m-4 md:m-8 lg:mr-0 lg:ml-8 items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Drop your memory files here</p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col w-full lg:w-1/2 p-4 md:p-8">
            {/* Title Input */}
            <label className="mb-5">
              <p className="font-medium text-base mb-2 text-gray-700">Title</p>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-purple-400 rounded-lg h-12 w-full font-medium text-base px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter memory title"
              />
            </label>

            {/* Description Input */}
            <label className="mb-5">
              <p className="font-medium text-base mb-2 text-gray-700">Description</p>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="border border-purple-400 rounded-lg w-full font-medium text-base p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your memory"
              />
            </label>

            {/* Wallet Addresses */}
            <label className="mb-5">
              <p className="font-medium text-base mb-2 text-gray-700">Wallet Address(es)</p>
              
              {/* Owners List */}
              <div className="w-full border border-purple-400 rounded-xl overflow-hidden bg-purple-50 mb-4">
                <div className="flex items-center px-4 h-9 bg-purple-200">
                  <p className="m-0 font-medium text-sm text-gray-800">Owner</p>
                </div>
                {owners.map((owner, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-2 border-t border-purple-200">
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => updateOwner(index, e.target.value)}
                      className="flex-1 text-xs text-gray-600 bg-transparent border-none outline-none"
                      placeholder="Enter wallet address"
                    />
                    <button 
                      onClick={() => removeOwner(index)}
                      className="w-5 h-5 hover:bg-purple-300 rounded-full flex items-center justify-center transition-colors ml-2"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add More Owner Button */}
              <button
                onClick={addOwner}
                className="flex w-full h-10 bg-purple-25 border border-purple-200 rounded-lg items-center justify-center hover:bg-purple-100 transition-colors mb-4"
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
            <button className="flex w-full h-12 items-center justify-center bg-purple-500 border-2 border-purple-500 rounded-full text-white font-semibold text-base hover:bg-purple-600 transition-colors mt-2">
              mint your memory
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 
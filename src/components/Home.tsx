"use client";

import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import WalletConnector from './wallet-connector';
import CreateMemoryForm from './CreateMemoryForm';

export default function Home() {
  const { authenticated, login } = usePrivy();
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <CreateMemoryForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div>
      <Head>
        <title>Memories on Chain</title>
        <meta name="description" content="Engrave your memories forever on chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full min-h-screen flex-col bg-cover bg-center relative" style={{backgroundImage: "url('/herobg.svg')"}}>
        {/* Floating dots decorations */}
        <img 
          src="/floatingdots.svg" 
          className="absolute -top-5 right-0 w-48 h-48 md:w-[300px] md:h-[300px] z-0" 
          alt="Floating dots decoration" 
        />
        <img 
          src="/floatingdots.svg" 
          className="absolute -bottom-5 left-0 w-48 h-48 md:w-[300px] md:h-[300px] z-0" 
          alt="Floating dots decoration" 
        />
        
        {/* Navigation */}
        <nav className="flex px-4 py-6 md:px-16 md:py-8 w-full max-w-7xl mx-auto justify-between items-center z-10">
          <h1 className="m-0 font-bold text-xl md:text-3xl bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent font-montserrat">
            Memories on Chain
          </h1>
          <WalletConnector />
        </nav>
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-4 md:px-8 max-w-7xl mx-auto z-10 gap-8 lg:gap-16">
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <h1 className="font-semibold text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight m-0 max-w-4xl text-black">
              Engrave your memories forever on chain 💜
            </h1>
            <p className="font-medium text-lg md:text-xl lg:text-2xl text-black/70 opacity-90 mt-4 m-0">
              capture the moments & mint them as memories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 mt-8 lg:mt-15 justify-center lg:justify-start">
              {!authenticated ? (
                <button 
                  onClick={login}
                  className="flex items-center justify-center bg-purple-500 border-2 border-purple-500 px-6 py-3 rounded-full text-white font-semibold text-base hover:bg-purple-600 transition-colors cursor-pointer"
                >
                  Connect Wallet
                </button>
              ) : (
                <button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center bg-green-500 border-2 border-green-500 px-6 py-3 rounded-full text-white font-semibold text-base hover:bg-green-600 transition-colors cursor-pointer"
                >
                  Start Creating Memories
                </button>
              )}
              <button className="flex items-center justify-center bg-white border-2 border-purple-500 px-6 py-3 rounded-full text-purple-600 font-semibold text-base hover:bg-purple-50 transition-colors">
                Explore Your Memories
              </button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="flex-shrink-0 order-1 lg:order-2">
            <Image 
              src="/heroimg.png" 
              alt="Hero illustration" 
              width={464}
              height={464}
              priority
              className="w-64 h-64 md:w-80 md:h-80 lg:w-[464px] lg:h-[464px] object-contain"
            />
          </div>
        </div>
      </main>
    </div>
  );
} 
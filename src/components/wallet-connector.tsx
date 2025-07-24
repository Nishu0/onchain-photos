import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { trimAddress } from "../lib/utils";

export default function WalletConnector() {
  const { authenticated, ready, login, logout } = usePrivy();
  const { address } = useAccount();
  
  return (
    <>
      {authenticated && ready ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="flex items-center justify-center bg-white rounded-full border-2 border-purple-400 text-purple-400 font-bold px-3 py-2 md:px-4 md:py-2 text-sm md:text-base">
            <Wallet className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{trimAddress(address as string)}</span>
            <span className="sm:hidden">{address ? trimAddress(address).split('...')[0] + '...' : ''}</span>
          </div>
          <button 
            onClick={logout} 
            className="hidden md:flex items-center justify-center bg-red-500 border-2 border-red-500 px-4 py-2 rounded-full text-white font-semibold text-sm hover:bg-red-600 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <button 
          onClick={login} 
          className="flex items-center justify-center bg-purple-500 border-2 border-purple-500 px-4 py-2 md:px-6 md:py-2 rounded-full text-white font-bold text-sm md:text-base hover:bg-purple-600 transition-colors cursor-pointer"
        >
          Connect Wallet
        </button>
      )}
    </>
  );
}
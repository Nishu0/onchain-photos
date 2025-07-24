"use client";

import dynamic from "next/dynamic";
import { MiniAppProvider } from "@neynar/react";
import WalletProvider from "~/providers/wallet";

const WagmiProvider = dynamic(
  () => import("~/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <WagmiProvider>
        <MiniAppProvider analyticsEnabled={true}>{children}</MiniAppProvider>
      </WagmiProvider>
    </WalletProvider>
  );
}

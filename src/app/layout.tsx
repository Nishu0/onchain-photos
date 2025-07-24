import type { Metadata } from "next";
import { Inter, Montserrat_Alternates } from "next/font/google";

import "~/app/globals.css";
import { Providers } from "~/app/providers";
import { APP_NAME, APP_DESCRIPTION } from "~/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat_Alternates({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat" 
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

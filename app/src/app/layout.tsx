import type { Metadata } from "next";

import { getServerAuthSession } from "~/server/nextauth";
import { ThemeProvider } from "~/components/ThemeProvider";
import SessionProvider from "~/components/SessionProvider";
import TrpcProvider from "~/components/TrpcProvider";
import { Toaster } from "sonner";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rhombus",
  description: "Rhombus",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider session={session}>
            <TrpcProvider>
              <Toaster richColors />
              {children}
            </TrpcProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

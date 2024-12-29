import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger, } from '@/components/ui/sidebar'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import localFont from 'next/font/local'
import './globals.css'
import { NavigationBreadcrumbs } from '@/components/navigation-breadcrumbs'
import { ClientWalletProvider } from '../components/client-wallet-provider'
import dynamic from 'next/dynamic'

import { Toaster } from '@/components/ui/toaster'
import { Suspense } from 'react'

const ClientSideHeaderSection = dynamic(() => import('../components/client-side-header-section').then(mod => mod.ClientSideHeaderSection), { ssr: false })

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Excalivator mining pool',
  description: 'Excalivator mining pool the first to mine and distribute COAL, ORE and CHROMIUM in a single process. Miner setup, pool stats and staking',
  keywords: ['solana', 'crypto', 'mining', 'pool'],
  robots: 'index, follow',
}

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ClientWalletProvider>
          <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
                <SidebarTrigger className="-ml-1"/>
                <Separator orientation="vertical" className="mr-2 h-4"/>
                <NavigationBreadcrumbs/>
                <ClientSideHeaderSection/>
              </header>
              <Suspense>{children}</Suspense>
            </SidebarInset>
          </SidebarProvider>
        </ClientWalletProvider>
      </ThemeProvider>
      <Toaster/>
    </body>
    </html>
  )
}

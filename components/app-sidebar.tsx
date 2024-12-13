'use client'

import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { Home, InfoIcon, Rocket } from 'lucide-react'
import { GiMiner } from 'react-icons/gi'

interface MenuData {
  title: string;
  url: string;
  isActive?: boolean;
  icon?: React.ComponentType;
  items?: MenuData[];
}

const data: MenuData[] = [
  {
    title: '',
    url: '/',
    items: [
      {
        title: 'Welcome',
        url: '/',
        icon: Home,
      },
    ],
  },
  {
    title: 'Getting started',
    url: '/getting-started',
    icon: Rocket,
    items: [
      {
        title: 'Quick start',
        url: '/getting-started/quick-start',
      },
      {
        title: 'Advanced mining',
        url: '/getting-started/advanced-mining',
      },
      {
        title: 'Mobile mining',
        url: '/getting-started/mobile-mining',
      },
    ],
  },
  {
    title: 'Info',
    url: '/info',
    icon: InfoIcon,
    items: [
      {
        title: 'Pool stats - WIP',
        // url: "/info/stats",
        url: '/work-in-progress',
      },
      {
        title: 'Pool details',
        url: '/info/pool-details',
      },
      {
        title: 'Token data',
        url: '/info/tokens-data',
      },
      {
        title: 'Team',
        url: '/info/team',
      },
      {
        title: 'Roadmap',
        url: '/info/roadmap',
      },
    ],
  },
  {
    title: 'Miner',
    url: '/miner',
    icon: GiMiner,
    items: [
      {
        title: 'Balance & Stats - WIP',
        url: '/miner/balance-stats',
      },
      {
        title: 'Claim rewards',
        // url: '/miner/claim-rewards',
        url: '/work-in-progress',
      },
      {
        title: 'Stake COAL',
        url: '/miner/stake-coal',
      },
      {
        title: 'Web mining - WIP',
        // url: "/miner/web-mining",
        url: '/work-in-progress',
      },
    ],
  },
]

export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const pathName = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarContent>
        {data.map((item) =>
          item.items ? (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>
                {item.icon && <item.icon/>}
                <span className="ml-2">{item.title}</span></SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathName === item.url}>
                        <a href={item.url}>{item.icon && <item.icon/>}
                          <span className="ml-2">{item.title}</span></a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.url}>{item.title}</a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarContent>
      <SidebarRail/>
    </Sidebar>
  )
}

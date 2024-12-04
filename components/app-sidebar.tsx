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

interface MenuData {
  title: string;
  url: string;
  isActive?: boolean;
  items?: MenuData[];
}

const data: MenuData[] = [
  {
    title: "Home",
    url: "/",
    items: [
      {
        title: "Welcome",
        url: "/",
      },
    ],
  },
  {
    title: "Getting started",
    url: "/getting-started",
    items: [
      {
        title: "Quick start",
        url: "/getting-started/quick-start",
      },
      {
        title: "Advanced mining",
        url: "/getting-started/advanced-mining",
      },
    ],
  },
  {
    title: "Info",
    url: "/info",
    items: [
      {
        title: "Pool details",
        // url: "/info/pool-details",
        url: "/work-in-progress",
      },
      {
        title: "Team",
        // url: "/info/pool-details",
        url: "/work-in-progress",
      },
      {
        title: "Pool stats",
        // url: "/info/stats",
        url: "/work-in-progress",
      },
    ],
  },
  {
    title: "Miner",
    url: "/miner",
    items: [
      {
        title: "View balance",
        // url: "/miner/balance",
        url: "/work-in-progress",
      },
      {
        title: "View stats",
        // url: "/miner/balance",
        url: "/work-in-progress",
      },
      {
        title: "Claim rewards",
        // url: "/miner/rewards",
        url: "/work-in-progress",
      },
      {
        title: "Staking",
        // url: "/miner/staking",
        url: "/work-in-progress",
      },
      {
        title: "Web mining",
        // url: "/miner/web-mining",
        url: "/work-in-progress",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        {data.map((item) =>
          item.items ? (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.url}>{item.title}</a>
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
      <SidebarRail />
    </Sidebar>
  );
}

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
    title: "Basics",
    url: "/basics",
    items: [
      {
        title: "View balance",
        url: "/basics/balance",
      },
      {
        title: "Claim rewards",
        url: "/basics/rewards",
      },
      {
        title: "Staking",
        url: "/basics/staking",
      },
      {
        title: "Pool details",
        url: "/basics/pool-details",
      },
    ],
  },
  {
    title: "Live information",
    url: "/info",
    items: [
      {
        title: "Pool stats",
        url: "/info/stats",
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

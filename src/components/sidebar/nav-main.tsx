'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  NAVIGATION,
  filterNavigation,
  isGroup,
  isLinkActive,
  isSection,
  type NavLink,
} from '@/config/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

const topLevelButton = cn(
  'h-9 rounded-md px-3 text-sm font-medium transition-colors',
  'data-active:bg-primary data-active:text-primary-foreground',
  'data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground',
);

function useCloseOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar();
  return () => {
    if (isMobile) setOpenMobile(false);
  };
}

function TopLevelLink({ link, pathname }: { link: NavLink; pathname: string }) {
  const closeOnNavigate = useCloseOnNavigate();
  const isActive = isLinkActive(pathname, link.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={link.title}
        isActive={isActive}
        className={topLevelButton}
        render={
          <Link
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={closeOnNavigate}
          />
        }
      >
        <link.icon />
        <span>{link.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SubLink({ link, pathname }: { link: NavLink; pathname: string }) {
  const closeOnNavigate = useCloseOnNavigate();
  const isActive = isLinkActive(pathname, link.href);

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={isActive}
        className="data-active:bg-muted data-active:text-foreground h-8 rounded-md data-active:font-medium"
        render={
          <Link
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={closeOnNavigate}
          />
        }
      >
        <link.icon />
        <span className="truncate">{link.title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export function NavMain() {
  const pathname = usePathname();
  const { can, isLoading } = usePermissions();

  if (isLoading) return null;
  const entries = filterNavigation(NAVIGATION, can);

  return (
    <>
      {entries.map((entry) => {
        if (isSection(entry)) {
          return (
            <SidebarGroup
              key={entry.section}
              className="-mb-1 p-0 pt-2 first:pt-0"
            >
              <SidebarGroupLabel className="text-sidebar-foreground h-6 p-0 text-xs font-medium uppercase">
                {entry.section}
              </SidebarGroupLabel>
            </SidebarGroup>
          );
        }

        if (isGroup(entry)) {
          const groupActive = entry.children.some((child) =>
            isLinkActive(pathname, child.href),
          );
          return (
            <SidebarGroup key={entry.title} className="p-0">
              <SidebarMenu>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      className="w-full"
                      render={
                        <SidebarMenuButton
                          tooltip={entry.title}
                          className="h-9 rounded-md px-3 text-sm font-medium"
                        >
                          <entry.icon />
                          <span>{entry.title}</span>
                          <ChevronRight
                            className={cn(
                              'ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90',
                              groupActive && 'text-primary',
                            )}
                          />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub className="me-0 pe-0">
                        {entry.children.map((child) => (
                          <SubLink
                            key={child.href}
                            link={child}
                            pathname={pathname}
                          />
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>
          );
        }

        return (
          <SidebarGroup key={entry.href} className="p-0">
            <SidebarMenu>
              <TopLevelLink link={entry} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}

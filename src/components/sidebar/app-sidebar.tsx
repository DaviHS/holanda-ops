'use client';

import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { NavMain } from './nav-main';
import { signOut, useSession } from 'next-auth/react';

interface CustomUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  roleId?: string;
  status?: string;
  employeeId?: string | null;
}

export function AppSidebar() {
  const { data: session } = useSession();
  const { setOpenMobile } = useSidebar();

  const user = session?.user as CustomUser | undefined;

  const userName = user?.name || 'Usuário';
  const userEmail = user?.email || '';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1)
      return (parts[0] ?? '').substring(0, 2).toUpperCase();

    const first = parts[0]?.[0] ?? '';
    const last = parts[parts.length - 1]?.[0] ?? '';
    return (first + last).toUpperCase() || 'U';
  };

  const initials = getInitials(userName);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/sign-in' });
  };

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="border-border/40 relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border shadow-xs">
                <Image
                  src="/android-chrome-192x192.png"
                  alt="Logo Holanda Ops"
                  width={36}
                  height={36}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-sidebar-foreground text-base font-extrabold tracking-wider">
                  HOLANDA
                </span>
                <span className="text-primary mt-0.5 text-[10px] font-bold tracking-[0.25em] uppercase">
                  ops
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavMain />
      </SidebarContent>

      <SidebarFooter className="border-border/60 border-t px-2 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full rounded-md"
                  />
                }
              >
                <Avatar className="border-border h-8 w-8 rounded-md border">
                  <AvatarFallback className="bg-primary/10 text-primary rounded-md font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userEmail}
                  </span>
                </div>
                <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md p-1 shadow-md"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="border-border h-8 w-8 rounded-md border">
                        <AvatarFallback className="bg-primary/10 text-primary rounded-md font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {userName}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {userEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/profile" />}
                  onClick={() => setOpenMobile(false)}
                  className="cursor-pointer rounded-md"
                >
                  <UserRound className="mr-2 size-4" />
                  Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-md"
                >
                  <LogOut className="mr-2 size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart3,
  Building2,
  CalendarClock,
  ChevronsUpDown,
  LogOut,
  Settings2,
  UserRound,
  Users,
} from "lucide-react";
import { NavMain, type NavItem } from "./nav-main";
import { signOut, useSession } from "next-auth/react";

export const navData: NavItem[] = [
  { label: "Visão Geral", isSection: true },
  { title: "Dashboard", icon: BarChart3, href: "/" },
  { label: "Gestão de Pessoal", isSection: true },
  {
    title: "Equipe e RH",
    icon: Users,
    children: [
      { title: "Setores", href: "/sectors", icon: Building2 },
      { title: "Funcionários", href: "/employees", icon: Users },
      { title: "Cargos", href: "/roles", icon: UserRound },
      { title: "Turnos", href: "/shifts", icon: CalendarClock },
    ],
  },
  {
    title: "Configurações",
    icon: Settings2,
    children: [
      { title: "Usuários", href: "/users", icon: Users },
    ],
  },
];

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

  const user = session?.user as CustomUser | undefined;

  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "";

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return (parts[0] ?? "").substring(0, 2).toUpperCase();

    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (first + last).toUpperCase() || "U";
  };

  const initials = getInitials(userName);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 shadow-xs">
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
                <span className="font-extrabold tracking-wider text-base text-sidebar-foreground">
                  HOLANDA
                </span>
                <span className="text-[10px] font-bold tracking-[0.25em] text-primary mt-0.5 uppercase">
                  ops
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavMain items={navData} />
      </SidebarContent>

      <SidebarFooter className="px-2 pt-2 border-t border-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl w-full"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg border border-border">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 shadow-md"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg border border-border">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{userName}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {userEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
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
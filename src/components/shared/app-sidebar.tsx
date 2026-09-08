"use client";

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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronsUpDown,
  ClipboardCheck,
  FileCheck2,
  FileText,
  LogOut,
  Package,
  Settings2,
  Shirt,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { NavMain, type NavItem } from "./nav-main";

export const navData: NavItem[] = [
  { label: "Visão Geral", isSection: true },
  { title: "Dashboard", icon: BarChart3, href: "dashboard" },
  { title: "Visão Operacional", icon: Zap, href: "visao" },

  { label: "Gestão de Pessoal", isSection: true },
  {
    title: "Equipe e RH",
    icon: Users,
    children: [
      { title: "Setores", href: "setores", icon: Building2 },
      { title: "Funcionários", href: "employees", icon: Users },
      { title: "Cargos", href: "cargos", icon: UserRound },
    ],
  },
  {
    title: "Controle de Ponto",
    icon: ClipboardCheck,
    children: [
      { title: "Escalas", href: "escalas", icon: CalendarDays },
      { title: "Frequência", href: "frequencia", icon: ClipboardCheck },
      { title: "Atestados", href: "atestados", icon: FileCheck2 },
    ],
  },

  { label: "Recursos & Suprimentos", isSection: true },
  {
    title: "Logística",
    icon: Package,
    children: [
      { title: "Uniformes", href: "uniformes", icon: Shirt },
      { title: "Estoque", href: "estoque", icon: Package },
      { title: "Contratos", href: "contratos", icon: FileText },
    ],
  },

  { label: "Operacional & Sistema", isSection: true },
  { title: "Ocorrências", icon: AlertCircle, href: "ocorrencias" },
  { title: "Relatórios", icon: BarChart3, href: "relatorios" },
  {
    title: "Configurações",
    icon: Settings2,
    children: [
      { title: "Usuários", href: "usuarios", icon: Users },
      { title: "Sistema", href: "configuracoes", icon: Settings2 },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-xs">
                H
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
              <DropdownMenuTrigger className="w-full text-left outline-none rounded-xl">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl w-full"
                >
                  <Avatar className="h-8 w-8 rounded-lg border border-border">
                    <AvatarImage src="" alt="Usuário" />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                      DS
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Davi Silva</span>
                    <span className="truncate text-xs text-muted-foreground">
                      davisilva@casasandreluiz.org.br
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 shadow-md"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border border-border">
                      <AvatarImage src="" alt="Usuário" />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                        DS
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Davi Silva</span>
                      <span className="truncate text-xs text-muted-foreground">
                        davisilva@casasandreluiz.org.br
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive">
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
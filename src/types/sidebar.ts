import { type LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  title: string;
  url: string;
  isActive?: boolean;
  roles?: string[]; 
  items?: {
    title: string;
    url: string;
    isActive?: boolean;
    roles?: string[];
  }[];
}

export interface App {
  title: string;
  url: string;
  image: string;
}

export interface User {
  name: string;
  email: string;
  treatment: string;
}

export interface SidebarConfig {
  appName: string;
  appUrl: string;
  appLogo: string;
  appDomain: string;
  navItems: NavItem[];
  basePath: string;
  logoutFn?: () => Promise<void>;
  apps?: App[];
}

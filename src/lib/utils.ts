import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Khớp route menu chính xác — tránh `/admin/news` active nhầm trên `/admin/newsletter-management`. */
export function isRouteActive(pathname: string, routePath: string): boolean {
  if (pathname === routePath) {
    return true;
  }

  return pathname.startsWith(`${routePath}/`);
}

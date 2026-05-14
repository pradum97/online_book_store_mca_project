"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { routeAccessConfig } from "@config/routeAccessConfig";
import { IRole } from "@app/auth/lib/session";

export const useRoleGuard = (role: IRole) => {
  const pathname = usePathname();

  const { isAllowed, isProtected } = useMemo(() => {
    const matchedRoute = Object.keys(routeAccessConfig).find((route) => {
      if (route === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(route);
    });

    if (!matchedRoute) {
      return { isAllowed: true, isProtected: false };
    }

    const allowedRoles = routeAccessConfig[matchedRoute];

    if (!allowedRoles || allowedRoles.length === 0) {
      return { isAllowed: true, isProtected: false };
    }

    return {
      isAllowed: allowedRoles.includes(role),
      isProtected: true,
    };
  }, [pathname, role]);

  return { isAllowed, isProtected };
};

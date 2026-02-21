"use client";

import { useMemo } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { canPerform, PermissionAction } from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      role: user?.role ?? null,
      can: (action: PermissionAction) => canPerform(user?.role, action),
    }),
    [user?.role]
  );
}

"use client";

import { useAuthSync } from "@/lib/useAuthSync";

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

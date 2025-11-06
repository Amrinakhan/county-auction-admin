import { ReactNode } from "react";
import { authGuard } from "@/lib/authGuard";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await authGuard();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}



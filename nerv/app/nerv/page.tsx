import { NervToastProvider } from "@mdrbx/nerv-ui";
import { currentSessionUser } from "@/lib/auth";
import { isStaff } from "@/lib/privs";
import { buildSnapshot } from "@/lib/snapshot";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await currentSessionUser();
  if (!user || !isStaff(user.priv)) redirect("/signin");

  const snap = await buildSnapshot();
  if (!snap) throw new Error("Database connection failed");

  return (
    <NervToastProvider>
      <DashboardClient initial={snap} operator={user.name} />
    </NervToastProvider>
  );
}

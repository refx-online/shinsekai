"use client";

import { usePathname } from "next/navigation";
import { NavigationTabs, Button, type NavigationTab } from "@mdrbx/nerv-ui";

const TABS: NavigationTab[] = [
  { id: "dashboard", label: "DASHBOARD" },
  { id: "flags", label: "FLAGS" },
  { id: "live", label: "LIVE" },
  { id: "performance", label: "PERF" },
  { id: "beatmaps", label: "MAPS" },
];

const PATHS: Record<string, string> = {
  dashboard: "/nerv",
  flags: "/nerv/flags",
  live: "/nerv/live",
  performance: "/nerv/performance",
  beatmaps: "/nerv/beatmaps",
};

export function NervNav() {
  const pathname = usePathname();
  // exact match wins; sub-paths (e.g. /nerv/u/3) fall through to their
  // section — dashboard's /nerv prefix must NOT swallow everything.
  const active =
    Object.entries(PATHS).find(([, p]) => pathname === p)?.[0] ??
    Object.entries(PATHS).find(([, p]) => p !== "/nerv" && pathname.startsWith(p + "/"))?.[0] ??
    "dashboard";
  return (
    <div className="flex items-stretch justify-between gap-2 border-b border-nerv-mid-gray/40 bg-nerv-black">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <NavigationTabs
          tabs={TABS}
          activeTab={active}
          onTabChange={(id) => {
            window.location.href = PATHS[id] ?? "/nerv";
          }}
        />
      </div>
      <div className="flex shrink-0 items-center px-2">
        <a href="/nerv/api/logout">
          <Button variant="ghost" size="sm">
            LOGOUT
          </Button>
        </a>
      </div>
    </div>
  );
}

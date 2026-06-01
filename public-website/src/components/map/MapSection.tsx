"use client";

import dynamic from "next/dynamic";
import type { School } from "@/lib/types";

const DynamicMapExplorer = dynamic(
  () => import("@/components/map/MapExplorer").then((mod) => mod.MapExplorer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center rounded-3xl bg-emerald-50 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
        Loading Nigeria map...
      </div>
    ),
  },
);

export function MapSection({ schools }: { schools: School[] }) {
  return <DynamicMapExplorer schools={schools} />;
}

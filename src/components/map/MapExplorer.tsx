"use client";

import { Filter, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { SchoolMap } from "@/components/map/SchoolMap";
import type { NeedCategory, NeedUrgency, School, SchoolType } from "@/lib/types";

type Filters = {
  location: string;
  type: "" | SchoolType;
  category: "" | NeedCategory;
  urgency: "" | NeedUrgency;
  verified: "" | "Verified" | "Other";
};

const defaultFilters: Filters = {
  location: "",
  type: "",
  category: "",
  urgency: "",
  verified: "",
};

export function MapExplorer({ schools }: { schools: School[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const states = [...new Set(schools.map((school) => school.state))].sort();
  const cities = [...new Set(schools.map((school) => school.city))].sort();
  const categories = [
    ...new Set(schools.flatMap((school) => school.needs.map((need) => need.category))),
  ].sort();

  const filtered = useMemo(() => {
    return schools.filter((school) => {
      const locationMatch =
        !filters.location ||
        school.state === filters.location ||
        school.city === filters.location;
      const typeMatch = !filters.type || school.type === filters.type;
      const categoryMatch =
        !filters.category ||
        school.needs.some((need) => need.category === filters.category);
      const urgencyMatch =
        !filters.urgency ||
        school.needs.some((need) => need.urgency === filters.urgency);
      const verifiedMatch =
        !filters.verified ||
        (filters.verified === "Verified"
          ? school.verificationStatus === "Verified"
          : school.verificationStatus !== "Verified");

      return (
        locationMatch &&
        typeMatch &&
        categoryMatch &&
        urgencyMatch &&
        verifiedMatch
      );
    });
  }, [filters, schools]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Filters
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {filtered.length} locations
            </h2>
          </div>
          <Filter className="h-5 w-5 text-blue-700" />
        </div>
        <div className="mt-5 space-y-4">
          <Select
            label="State or city"
            value={filters.location}
            onChange={(location) => setFilters((f) => ({ ...f, location }))}
            options={["", ...states, ...cities]}
          />
          <Select
            label="School type"
            value={filters.type}
            onChange={(type) =>
              setFilters((f) => ({ ...f, type: type as Filters["type"] }))
            }
            options={["", "Public School", "Madrasa", "Community School"]}
          />
          <Select
            label="Need category"
            value={filters.category}
            onChange={(category) =>
              setFilters((f) => ({
                ...f,
                category: category as Filters["category"],
              }))
            }
            options={["", ...categories]}
          />
          <Select
            label="Urgency"
            value={filters.urgency}
            onChange={(urgency) =>
              setFilters((f) => ({ ...f, urgency: urgency as Filters["urgency"] }))
            }
            options={["", "Critical", "High", "Medium", "Completed"]}
          />
          <Select
            label="Verified status"
            value={filters.verified}
            onChange={(verified) =>
              setFilters((f) => ({
                ...f,
                verified: verified as Filters["verified"],
              }))
            }
            options={["", "Verified", "Other"]}
          />
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset filters
          </button>
        </div>
      </aside>
      <SchoolMap schools={filtered} />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option || "all"} value={option}>
            {option || "All"}
          </option>
        ))}
      </select>
    </label>
  );
}

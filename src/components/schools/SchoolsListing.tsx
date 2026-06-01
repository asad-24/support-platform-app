"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SchoolCard } from "@/components/schools/SchoolCard";
import type { School } from "@/lib/types";

export function SchoolsListing({ schools }: { schools: School[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");

  const filtered = useMemo(() => {
    return schools.filter((school) => {
      const text = `${school.name} ${school.city} ${school.state}`.toLowerCase();
      return (
        text.includes(query.toLowerCase()) &&
        (!type || school.type === type)
      );
    });
  }, [query, schools, type]);

  return (
    <div>
      <div className="mb-8 grid gap-4 rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 md:grid-cols-[1fr_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search schools, city, or state"
            className="h-12 w-full rounded-2xl border border-slate-200 pl-12 pr-4 font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-12 rounded-2xl border border-slate-200 px-4 font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">All types</option>
          <option>Public School</option>
          <option>Madrasa</option>
          <option>Community School</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-slate-950">No schools found</h2>
          <p className="mt-2 text-slate-600">
            Try another state, city, school name, or type.
          </p>
        </div>
      )}
    </div>
  );
}

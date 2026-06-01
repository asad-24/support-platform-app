"use client";

import { HeartHandshake, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const nav = [
  ["Map", "/map"],
  ["Schools", "/schools"],
  ["Needs", "/needs"],
  ["Impact", "/impact"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-black leading-tight text-slate-950">
              Naija School Relief
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Welfare platform
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/needs"
          className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:inline-flex"
        >
          Sponsor a Need
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={`grid border-t border-slate-200 bg-white transition-[grid-template-rows] duration-300 md:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-4">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-black text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/needs"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Sponsor a Need
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-white/20">
              <img src="/logo_school.png" alt="School Support Atlas" className="h-full w-full object-cover" />
            </span>
            <div>
              <p className="text-lg font-black">School Support Atlas</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                Verified school welfare
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md leading-7 text-slate-300">
            Connecting helpers with verified schools and madrasas across Nigeria
            through transparent needs, local verification, and practical support.
          </p>
        </div>
        <div>
          <p className="font-black">Explore</p>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
            <Link href="/map" className="hover:text-white">Interactive Map</Link>
            <Link href="/schools" className="hover:text-white">Schools</Link>
            <Link href="/needs" className="hover:text-white">Needs</Link>
            <Link href="/impact" className="hover:text-white">Impact</Link>
          </div>
        </div>
        <div>
          <p className="font-black">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <p className="flex gap-2"><MapPin className="h-4 w-4 text-emerald-300" /> Kano, Nigeria</p>
            <p className="flex gap-2"><Mail className="h-4 w-4 text-emerald-300" /> contact@schoolsupportatlas.com</p>
            <p className="flex gap-2"><Phone className="h-4 w-4 text-emerald-300" /> +234 800 000 0000</p>
          </div>
        </div>
        <div>
          <p className="font-black">App</p>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
            <Link href="/app" className="hover:text-white">Android App</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/data-deletion" className="hover:text-white">Data Deletion</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-slate-400">
        Built for transparent school welfare support.
      </div>
    </footer>
  );
}

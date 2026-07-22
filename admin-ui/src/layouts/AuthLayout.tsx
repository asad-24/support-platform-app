import type { ReactNode } from "react";
import { ClipboardCheck, School, Users } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background" style={{ backgroundColor: "#f8faf9" }}>
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-sidebar via-sidebar to-sidebar-accent p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-sidebar-border/30">
              <img src="/logo_school.png" alt="School Support Atlas" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-xl font-semibold">School Support Atlas</div>
              <div className="text-sm text-sidebar-foreground/70">Admin operations</div>
            </div>
          </div>
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex rounded-full border border-sidebar-primary/30 bg-sidebar-accent/50 px-4 py-2 text-sm text-sidebar-foreground/80">
              Secure school and volunteer administration
            </div>
            <h1 className="text-5xl font-semibold leading-tight">Manage reviews, requests, users, and school records from one dense workspace.</h1>
            <p className="mt-5 max-w-xl text-base text-sidebar-foreground/75">
              School Support Atlas keeps field submissions, registration reviews, and operational notifications close together for fast admin decisions.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { label: "Schools", icon: School },
              { label: "Requests", icon: ClipboardCheck },
              { label: "Users", icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-sidebar-border/30 bg-sidebar-accent/45 p-4">
                  <Icon className="size-4 text-sidebar-primary" />
                  <div className="mt-2 font-medium">{item.label}</div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="flex items-center justify-center p-6 md:p-10 xl:p-14">
          <div className="w-full max-w-2xl">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-border">
                <img src="/logo_school.png" alt="School Support Atlas" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="text-xl font-semibold">School Support Atlas</div>
                <div className="text-sm text-muted-foreground">Admin operations</div>
              </div>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

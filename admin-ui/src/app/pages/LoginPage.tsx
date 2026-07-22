import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { errorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex min-h-[18rem] flex-col justify-between bg-sidebar px-6 py-8 text-sidebar-foreground sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-sidebar-border/30">
              <img src="/logo_school.png" alt="School Support Atlas" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-lg font-semibold">School Support Atlas</div>
              <div className="text-sm text-sidebar-foreground/70">Admin Panel</div>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              School Support Atlas Admin Panel
            </h1>
            <p className="mt-5 max-w-lg text-base text-sidebar-foreground/78 sm:text-lg">
              Review volunteer registration requests, approve qualified applicants, and monitor new admin notifications from one secure workspace.
            </p>
          </div>

          <div className="hidden text-sm text-sidebar-foreground/60 lg:block">
            Cookie-secured admin access with backend-managed JWT refresh.
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Admin login</h2>
              <p className="mt-2 text-sm text-muted-foreground">Use your active administrator email and password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@schoolsupportatlas.local"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="h-11 w-full" disabled={submitting || loading}>
                {submitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { AuthLayout } from "@layouts/AuthLayout";
import { apiRequest, errorMessage } from "@services/api";
import { authActions } from "@store/authSlice";
import { useAppDispatch } from "@store/hooks";
import type { AdminUser } from "@app/lib/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type UserResponse = {
  success: true;
  data: {
    user: AdminUser;
    accessToken?: string;
    refreshToken?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid login details.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest<UserResponse>("/auth/admin/login", {
        method: "POST",
        body: parsed.data,
        retryOnUnauthorized: false,
      });
      dispatch(authActions.setUser(response.data.user));
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="rounded-3xl border-sidebar-border/30 shadow-2xl">
        <CardHeader className="px-8 pt-8 md:px-10 md:pt-10">
          <CardTitle className="text-3xl">Admin login</CardTitle>
          <CardDescription className="text-base">Use your School Support Atlas administrator account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 md:px-10 md:pb-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-[52px] rounded-2xl bg-white pl-12 text-base shadow-sm"
                  id="email"
                  type="email"
                  placeholder="admin@schoolsupportatlas.local"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-[52px] rounded-2xl bg-white pl-12 pr-12 text-base shadow-sm"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 size-10 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </Button>
              </div>
            </div>
            {error ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="h-[52px] w-full rounded-2xl text-base" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
              <ArrowRight className="size-4" />
            </Button>
            <p className="text-center text-sm text-muted-foreground">Accounts are managed by the primary administrator.</p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

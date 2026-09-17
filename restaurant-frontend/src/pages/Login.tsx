import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { LogIn } from "lucide-react";

import { authApi, getErrorMessage } from "@/api";
import { Button } from "@/components/ui/button";
import GustoLogo from "@/assets/Gusto.png";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.post("/login", { email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to log in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4 py-16 text-white">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <img
            src={GustoLogo}
            alt="Gusto"
            className="h-10 w-10 rounded-full object-contain"
          />
          <span className="text-lg font-bold tracking-wide">GUSTO</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#fbbf24]/50 bg-[#1a1a1a] p-8">
          <h1 className="text-xl font-semibold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-white/50">
            Sign in to manage GUSTO's dashboard.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-white/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                placeholder="admin@gusto.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-white/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm tracking-widest text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                placeholder="6-digit password"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="mt-2 bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

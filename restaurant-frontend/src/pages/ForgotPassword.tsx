import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { KeyRound } from "lucide-react";

import { getErrorMessage } from "@/api";
import {
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
} from "@/api/passwordReset";
import { Button } from "@/components/ui/button";
import GustoLogo from "@/assets/Gusto.png";

type Step = "email" | "otp" | "password";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [rememberToken, setRememberToken] = useState("");

  const [otp, setOtp] = useState("");
  const [verifyToken, setVerifyToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await requestPasswordReset(email);
      setRememberToken(data.rememberToken);
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to request a reset code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await verifyResetOtp(email, otp, rememberToken);
      setVerifyToken(data.token);
      setStep("password");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email, password, verifyToken);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to reset password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <img
            src={GustoLogo}
            alt="Gusto"
            className="h-10 w-10 rounded-full object-contain"
          />
          <span className="text-lg font-bold tracking-wide">GUSTO</span>
        </div>

        <div className="rounded-2xl border border-[#fbbf24]/50 bg-[#1a1a1a] p-8">
          <h1 className="text-xl font-semibold text-white">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {step === "email" &&
              "Enter your admin email to request a reset code."}
            {step === "otp" && `Enter the 6-digit code sent for ${email}.`}
            {step === "password" && "Choose a new 6-digit password."}
          </p>

          {step === "email" && (
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleRequestOtp}
            >
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

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="mt-2 bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
              >
                <KeyRound className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleVerifyOtp}
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp" className="text-sm text-white/70">
                  Reset Code
                </label>
                <input
                  id="otp"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm tracking-widest text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                  placeholder="6-digit code"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="mt-2 bg-[#fbbf24] text-black hover:bg-[#fbbf24]/80"
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {step === "password" && (
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleResetPassword}
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm text-white/70">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border border-white/10 bg-white/5 px-4 text-sm tracking-widest text-white outline-none placeholder:text-white/30 focus:border-[#fbbf24]/60"
                  placeholder="6-digit password"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm text-white/70"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/40">
            <Link to="/login" className="text-[#fbbf24] hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // for main form actions
  const [resendLoading, setResendLoading] = useState(false); // for resend only
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(
        () => setResendTimer(resendTimer - 1),
        1000
      );
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendTimer]);

  async function handleRequest(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setResendLoading(true);
    const res = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendLoading(false);
    if (res.ok) {
      setStep(2);
      setResendTimer(20);
      toast.success("A reset code has been sent to your email.");
    } else {
      toast.error("Failed to send reset code. Please check your email.");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/verify-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setLoading(false);
    if (res.ok) {
      setStep(3);
      toast.success("Code verified! Set your new password.");
    } else {
      toast.error("Invalid or expired code.");
    }
  }

  function isStrongPassword(pw: string) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      pw
    );
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isStrongPassword(password)) {
      toast.error("Password is not strong enough.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Password reset successful! You can now log in.");
      redirect("/");
    } else {
      toast.error("Failed to reset password. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your email to receive a password reset code.
        </p>
        {step === 1 && (
          <form onSubmit={handleRequest} className="w-full space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 placeholder-gray-400 bg-gray-50"
              placeholder="Enter your email"
              autoComplete="email"
            />
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-[10px] shadow transition-all duration-200 tracking-wide mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}
        {step === 2 && (
          <>
            <form onSubmit={handleVerify} className="w-full space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 placeholder-gray-400 bg-gray-50"
                placeholder="Enter the code you received"
              />
              <button
                type="button"
                onClick={() => handleRequest()}
                className="w-full flex justify-end text-sm bg-transparent text-red-600 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={resendTimer > 0 || resendLoading}
              >
                {resendLoading
                  ? "Sending..."
                  : resendTimer > 0
                  ? `Resend code (${resendTimer}s)`
                  : "Resend code"}
              </button>
              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-[10px] shadow transition-all duration-200 tracking-wide mt-2 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          </>
        )}
        {step === 3 && (
          <form onSubmit={handleReset} className="w-full space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 placeholder-gray-400 bg-gray-50"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <div className="text-xs text-gray-500 mb-1">
              Password must be at least 8 characters and include uppercase,
              lowercase, number, and special character.
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-[10px] shadow transition-all duration-200 tracking-wide mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

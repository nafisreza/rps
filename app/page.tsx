"use client";

import { NotebookPen, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    // Email regex validation for IUT emails
    const iutEmailRegex = /^[a-zA-Z0-9._%+-]+@iut-dhaka\.edu$/;
    if (!iutEmailRegex.test(email)) {
      toast.error("Please enter your IUT email.");
      setEmail("");
      setPassword("");
      setLoading(false);
      return;
    }
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      toast.error("Incorrect email or password");
      setEmail("");
      setPassword("");
      setLoading(false);
    } else {
      // Fetch session to get user
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      const mustChangePassword = session?.user?.mustChangePassword;
      if (mustChangePassword) {
        router.push("/change-password");
      } else if (role === "ADMIN") router.push("/admin");
      else if (role === "TEACHER") router.push("/teacher");
      else if (role === "STUDENT") router.push("/student");
      else router.push("/");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-gray-200 rounded-full p-3 mb-3">
            <NotebookPen className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-1 text-gray-800 tracking-tight">
            IUT Result Processing System
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Please sign in to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 placeholder-gray-400 bg-gray-50"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 placeholder-gray-400 bg-gray-50 pr-10"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <a
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline mb-1"
              tabIndex={-1}
            >
              Forgot password?
            </a>
            <button
              type="submit"
              className=" bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-[10px] shadow transition-all duration-200 tracking-wide mt-2 cursor-pointer"
              disabled={loading}
            >
              Login
            </button>
          </div>
        </form>
        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Team Dijkstra
        </div>
      </div>
    </div>
  );
}

"use client";

import { NotebookPen } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      // Fetch session to get user role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "TEACHER") router.push("/teacher");
      else if (role === "STUDENT") router.push("/student");
      else router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="relative w-full max-w-lg p-0">
        <div className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30" style={{ zIndex: 1 }}></div>
        <div className="relative z-10 p-10 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center">
            <div className="bg-gradient-to-br from-blue-200 to-pink-200 rounded-full p-4 shadow-lg mb-2">
              <NotebookPen />
            </div>
            <h2 className="text-4xl font-bold text-center mb-2 text-gray-800 tracking-tight">Result Processing System</h2>
            <p className="text-sm text-gray-500 text-center">Sign in to access your dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-none rounded-xl bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 placeholder-gray-400"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-none rounded-xl bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 placeholder-gray-400"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center rounded-lg bg-red-50 py-2 px-4 shadow">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 via-purple-200 to-pink-200 hover:from-blue-500 hover:to-pink-300 text-gray-900 font-bold py-3 rounded-xl shadow-lg transition-all duration-200 text-lg tracking-wide"
            >
              Login
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Result Processing System
          </div>
        </div>
      </div>
    </div>
  );
}

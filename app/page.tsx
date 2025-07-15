"use client";

import { NotebookPen } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Fetch session to get user role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "ADMIN") router.push("/admin");
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 placeholder-gray-400 bg-gray-50"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          {/* Error messages are now shown as toast notifications */}
          <div className="flex justify-end">
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

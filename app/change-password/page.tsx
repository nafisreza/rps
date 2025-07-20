"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Password changed successfully. Please log in again.");
      router.push("/");
    } else {
      toast.error("Password not strong enough. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Change Password</h2>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-[10px] shadow transition-all duration-200 tracking-wide mt-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

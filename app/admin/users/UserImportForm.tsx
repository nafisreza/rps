"use client";
import { useState } from "react";

export default function UserImportForm() {
  const [role, setRole] = useState("STUDENT");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    const res = await fetch("/api/admin/import-users", {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      setMessage("Users imported successfully!");
      setFile(null);
    } else {
      setMessage("Failed to import users.");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex gap-4 items-center">
        <select value={role} onChange={e => setRole(e.target.value)} className="border rounded px-3 py-2">
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </select>
        <input
          type="file"
          accept=".csv"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="border rounded px-3 py-2"
          required
        />
      </div>
     <div>
         <button
        type="submit"
        className="bg-sky-700 text-white px-6 py-2 rounded hover:bg-sky-800 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Importing..." : "Import Users"}
      </button>
     </div>
      {message && <div className="text-sm text-center mt-2">{message}</div>}
      <div className="text-xs text-gray-500 mt-2">CSV must have columns: <b>email,password</b></div>
    </form>
  );
}

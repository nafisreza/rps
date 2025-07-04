"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function UserImportForm() {
  const [role, setRole] = useState("STUDENT");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    const res = await fetch("/api/admin/import-users", {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Users imported successfully!");
      setFile(null);
    } else {
      toast.error("Failed to import users.");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex gap-4 items-center">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="file"
          accept=".csv, .xls, .xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="flex-1"
          required
        />
      </div>
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Importing..." : "Import Users"}
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        {role === "STUDENT" ? (
          <>File must have columns: <b>email, password, name, department, batch, studentId</b></>
        ) : (
          <>File must have columns: <b>email, password, name, department, designation</b></>
        )}
      </div>
    </form>
  );
}

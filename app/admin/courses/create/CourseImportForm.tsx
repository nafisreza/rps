"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CourseImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/import-courses", {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Courses imported successfully!");
      setFile(null);
    } else {
      toast.error("Duplicate codes or invalid data.");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex gap-4 items-center">
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
          {loading ? "Importing..." : "Import Courses"}
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        File must have columns: <b>name, code, credit, semester, department, program, teacher</b>
      </div>
      <div className="flex gap-4 items-center">
        <p className="text-xs">Course Templates:</p>
        <a
          href="/data/courses-template.csv"
          download
          className="text-xs text-indigo-600 hover:underline"
        >
          CSV
        </a>
        <a
          href="/data/courses-template.xlsx"
          download
          className="text-xs text-indigo-600 hover:underline"
        >
          Excel
        </a>
      </div>
    </form>
  );
}

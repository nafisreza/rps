'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CourseImportForm from "./CourseImportForm";
import { Card } from "@/components/ui/card";

// Types
type Department = { id: string; name: string };
type Teacher = { id: string; name: string };

export default function CreateCoursePage() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    credit: "",
    semester: "",
    departmentId: "",
    teacherId: "",
    programId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  useEffect(() => {
    if (form.departmentId) {
      fetch(`/api/admin/users?role=teacher&departmentId=${form.departmentId}`)
        .then((res) => res.json())
        .then((data) => setTeachers(data.teachers || []));
    } else {
      setTeachers([]);
      setForm((f) => ({ ...f, teacherId: "" }));
    }
  }, [form.departmentId]);

  useEffect(() => {
    if (form.departmentId) {
      fetch(`/api/departments?id=${form.departmentId}`)
        .then((res) => res.json())
        .then((data) => setPrograms(data.programs || []));
    } else {
      setPrograms([]);
      setForm((f) => ({ ...f, programId: "" }));
    }
  }, [form.departmentId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        credit: Number(form.credit),
        semester: Number(form.semester),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success("Course created");
      router.push("/admin/courses");
    } else {
      toast.error(data.error || "Error creating course");
    }
  };

  return (
    <main className="flex-1 p-8">
      <div className="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto">
        <div className="md:w-1/2 w-full">
          <Card className="p-8 mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-4">Import Courses</h2>
            <CourseImportForm />
          </Card>
        </div>
        <div className="md:w-1/2 w-full">
          <Card className="p-8">
            <h2 className="text-xl font-bold mb-6">Add New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Code</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Credit</label>
                <Input
                  type="number"
                  value={form.credit}
                  onChange={(e) => setForm({ ...form, credit: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Semester</label>
                <Input
                  value={form.semester}
                  type="number"
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Department</label>
                <Select
                  value={form.departmentId}
                  onValueChange={(value) =>
                    setForm({ ...form, departmentId: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>
                        {dep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1">Program</label>
                <Select
                  value={form.programId}
                  onValueChange={(value) =>
                    setForm({ ...form, programId: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1">Teacher</label>
                <Select
                  value={form.teacherId === "" ? "none" : form.teacherId}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      teacherId: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select faculty</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/admin/courses")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

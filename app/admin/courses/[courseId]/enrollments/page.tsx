"use client";
import { useState, useEffect } from "react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminCourseEnrollmentsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ [studentId: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const { courseId } = React.use(params);

  useEffect(() => {
    // Fetch students matching course's semester, dept, program
    fetch(`/api/admin/courses/${courseId}/eligible-students`)
      .then((res) => res.json())
      .then(({ students }) => {
        setStudents(students);
        // By default, select all
        const initial: any = {};
        students.forEach((s: any) => { initial[s.id] = true; });
        setSelected(initial);
      });
  }, [courseId]);

  function toggleAll(val: boolean) {
    const updated: any = {};
    students.forEach((s: any) => { updated[s.id] = val; });
    setSelected(updated);
  }

  function handleChange(studentId: string, checked: boolean) {
    setSelected((prev) => ({ ...prev, [studentId]: checked }));
  }

  async function enrollSelected() {
    setLoading(true);
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    const res = await fetch(`/api/admin/courses/${courseId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: selectedIds }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Enrollment updated!");
    } else {
      toast.error("Failed to update enrollment.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Course Enrollment</h1>
      <div className="mb-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => toggleAll(true)}>Select All</Button>
        <Button size="sm" variant="outline" onClick={() => toggleAll(false)}>Deselect All</Button>
      </div>
      <div className="overflow-x-auto rounded shadow border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Select</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Student ID</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={!!selected[student.id]}
                    onChange={(e) => handleChange(student.id, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.studentId}</td>
                <td className="px-4 py-2">{student.batch}</td>
                <td className="px-4 py-2">{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        className="mt-4"
        variant="default"
        onClick={enrollSelected}
        disabled={loading}
      >
        {loading ? "Saving..." : "Update Enrollment"}
      </Button>
    </div>
  );
}

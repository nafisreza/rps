"use client";
import { useState, useEffect } from "react";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function AdminCourseEnrollmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ [studentId: string]: boolean }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const { courseId } = React.use(params);

  useEffect(() => {
    // Fetch course info
    fetch(`/api/admin/courses/${courseId}/info`)
      .then((res) => res.json())
      .then(({ course }) => setCourseInfo(course));
    // Fetch students matching course's semester, dept, program
    fetch(`/api/admin/courses/${courseId}/eligible-students`)
      .then((res) => res.json())
      .then(({ students }) => {
        setStudents(students);
        // By default, select all
        const initial: any = {};
        students.forEach((s: any) => {
          initial[s.id] = true;
        });
        setSelected(initial);
      });
  }, [courseId]);

  function toggleAll(val: boolean) {
    const updated: any = {};
    students.forEach((s: any) => {
      updated[s.id] = val;
    });
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
    <div className="mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Course Enrollment</h2>
      {/* Course Info Section */}
      {courseInfo && (
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            {courseInfo.name}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 text-gray-700 text-base font-medium">
            <div>
              <span className="font-semibold">Code:</span> {courseInfo.code}
            </div>
            <div>
              <span className="font-semibold">Semester:</span>{" "}
              {courseInfo.semester}
            </div>
            <div>
              <span className="font-semibold">Dept:</span>{" "}
              {courseInfo.department?.name}
            </div>
            <div>
              <span className="font-semibold">Program:</span>{" "}
              {courseInfo.program?.name}
            </div>
            <div>
              <span className="font-semibold">Credit:</span> {courseInfo.credit}
            </div>
            <div>
              <span className="font-semibold">Faculty:</span>{" "}
              {courseInfo.teacher?.name || "-"}
            </div>
          </div>
        </div>
      )}
      <div className="mb-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => toggleAll(true)}>
          Select All
        </Button>
        <Button size="sm" variant="outline" onClick={() => toggleAll(false)}>
          Deselect All
        </Button>
      </div>
      <div className="overflow-x-auto rounded shadow border bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-4 py-2">Select</TableHead>
              <TableHead className="px-4 py-2">Name</TableHead>
              <TableHead className="px-4 py-2">Student ID</TableHead>
              <TableHead className="px-4 py-2">Batch</TableHead>
              <TableHead className="px-4 py-2">Program</TableHead>
              <TableHead className="px-4 py-2">Department</TableHead>
              <TableHead className="px-4 py-2">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="border-b">
                <TableCell className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={!!selected[student.id]}
                    onChange={(e) => handleChange(student.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell className="px-4 py-2">{student.name}</TableCell>
                <TableCell className="px-4 py-2">{student.studentId}</TableCell>
                <TableCell className="px-4 py-2">{student.batch}</TableCell>
                <TableCell className="px-4 py-2">{courseInfo?.program?.name || "-"}</TableCell>
                <TableCell className="px-4 py-2">{courseInfo?.department?.name || "-"}</TableCell>
                <TableCell className="px-4 py-2">{student.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

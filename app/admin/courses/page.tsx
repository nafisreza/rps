'use client';

import { useEffect, useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
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

// Types
type Course = {
  id?: string;
  name: string;
  code: string;
  credit: number;
  semester: string;
  departmentId: string;
  teacherId?: string;
  department?: { name: string };
  teacher?: { name: string };
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Course | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses);
        setLoading(false);
      });
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []));
    fetch("/api/admin/users?role=teacher")
      .then((res) => res.json())
      .then((data) => setTeachers(data.teachers || []));
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Course deleted");
      setCourses(courses.filter((c) => c.id !== id));
    } else {
      toast.error("Failed to delete course");
    }
    setDeleteId(null);
  };

  const openEditModal = (course: Course) => {
    setEditCourse(course);
    setEditForm(course);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editForm?.id) return;
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Course updated");
      setShowEditModal(false);
      setEditCourse(null);
      setEditForm(null);
      // Refresh list
      setLoading(true);
      fetch("/api/admin/courses")
        .then((res) => res.json())
        .then((data) => {
          setCourses(data.courses);
          setLoading(false);
        });
    } else {
      toast.error(data.error || "Error updating course");
    }
  };

  return (
      <main className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Courses</h2>
            <Button onClick={() => router.push("/admin/courses/create")}>Add Course</Button>
          </div>
          <div className="overflow-x-auto rounded-lg shadow border bg-white">
            <Table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Credit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Semester</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Teacher</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center">Loading...</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center">No courses found.</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{course.name}</td>
                      <td className="px-4 py-2">{course.code}</td>
                      <td className="px-4 py-2">{course.credit}</td>
                      <td className="px-4 py-2">{course.semester}</td>
                      <td className="px-4 py-2">{course.department?.name}</td>
                      <td className="px-4 py-2">{course.teacher?.name || "-"}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(course)}>Edit</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button variant="destructive" type="button" onClick={() => handleDelete(course.id!)}>Delete</Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-xl mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
              <div>
                <label className="block mb-1">Name</label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1">Code</label>
                <Input value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1">Credit</label>
                <Input type="number" value={editForm.credit} onChange={e => setEditForm({ ...editForm, credit: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="block mb-1">Semester</label>
                <Input value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1">Department</label>
                <Select value={editForm.departmentId} onValueChange={value => setEditForm({ ...editForm, departmentId: value })} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1">Teacher</label>
                <Select
                  value={editForm.teacherId === "" ? "none" : editForm.teacherId}
                  onValueChange={value => setEditForm({ ...editForm, teacherId: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select faculty</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

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
  programId?: string;
  department?: { name: string };
  teacher?: { name: string };
  program?: { name: string };
};

import { Funnel, Search } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Course | null>(null);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [filterDept, setFilterDept] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterCredit, setFilterCredit] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch departments, teachers, and programs for filters
  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []));
    fetch("/api/admin/users?role=teacher")
      .then((res) => res.json())
      .then((data) => setTeachers(data.teachers || []));
  }, []);

  // Fetch programs when department filter changes
  useEffect(() => {
    if (filterDept) {
      fetch(`/api/departments?id=${filterDept}`)
        .then((res) => res.json())
        .then((data) => setPrograms(data.programs || []));
    } else {
      setPrograms([]);
      setFilterProgram("");
    }
  }, [filterDept]);

  // Fetch courses with filters/search
  useEffect(() => {
    setLoading(true);
    let url = `/api/admin/courses?`;
    if (filterDept) url += `departmentId=${filterDept}&`;
    if (filterProgram) url += `programId=${filterProgram}&`;
    if (filterSemester) url += `semester=${filterSemester}&`;
    if (filterTeacher) url += `teacherId=${filterTeacher}&`;
    if (filterCredit) url += `credit=${filterCredit}&`;
    if (searchName) url += `name=${encodeURIComponent(searchName)}&`;
    if (searchCode) url += `code=${encodeURIComponent(searchCode)}&`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses);
        setLoading(false);
      });
  }, [filterDept, filterProgram, filterSemester, filterTeacher, filterCredit, searchName, searchCode]);

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
      {/* Search and Filters */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-4 mb-4">
          <Search className="w-4" />
          <Input
            placeholder="Course name"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="w-[180px]"
          />
          <Input
            placeholder="Course code"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            className="w-[180px]"
          />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Funnel className="w-4" />
          <Select value={filterDept || "all"} onValueChange={v => setFilterDept(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Department</SelectItem>
              {departments.map(dep => (
                <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterProgram || "all"} onValueChange={v => setFilterProgram(v === "all" ? "" : v)} disabled={!filterDept}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Program</SelectItem>
              {programs.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSemester || "all"} onValueChange={v => setFilterSemester(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semester</SelectItem>
              {[1,2,3,4,5,6,7,8].map(s => (
                <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTeacher || "all"} onValueChange={v => setFilterTeacher(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Teacher</SelectItem>
              {teachers.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCredit || "all"} onValueChange={v => setFilterCredit(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Credit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Credit</SelectItem>
              {[0.75,1,1.5,2,3,4].map(c => (
                <SelectItem key={c} value={c.toString()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Program</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Teacher</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center">Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center">No courses found.</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{course.name}</td>
                  <td className="px-4 py-2">{course.code}</td>
                  <td className="px-4 py-2">{course.credit}</td>
                  <td className="px-4 py-2">{course.semester}</td>
                  <td className="px-4 py-2">{course.department?.name}</td>
                  <td className="px-4 py-2">{course.program?.name || '-'} </td>
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
                <label className="block mb-1">Program</label>
                <Select value={editForm.programId || ""} onValueChange={value => setEditForm({ ...editForm, programId: value })} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={programs.length ? "Select program" : "Select department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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

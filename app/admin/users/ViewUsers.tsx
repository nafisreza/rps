"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Funnel, Search } from "lucide-react";

export default function ViewUsers() {
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [batch, setBatch] = useState("");
  const [designation, setDesignation] = useState("");
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [searchName, setSearchName] = useState("");
  const [searchStudentId, setSearchStudentId] = useState("");
  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  useEffect(() => {
    if (department) {
      fetch(`/api/departments?id=${department}`)
        .then((res) => res.json())
        .then((data) => setPrograms(data.programs || []));
      setProgram("");
    } else {
      setPrograms([]);
      setProgram("");
    }
  }, [department]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let url = `/api/admin/users?role=${role}`;
    if (department) url += `&departmentId=${department}`;
    if (program && role === "student") url += `&programId=${program}`;
    if (batch && role === "student") url += `&batch=${batch}`;
    if (designation && role === "teacher") url += `&designation=${designation}`;
    if (searchName) url += `&name=${encodeURIComponent(searchName)}`;
    if (role === "student" && searchStudentId)
      url += `&studentId=${encodeURIComponent(searchStudentId)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setUsers(role === "student" ? data.students : data.teachers);
        setLoading(false);
      });
  }, [
    role,
    department,
    program,
    batch,
    designation,
    searchName,
    searchStudentId,
  ]);

  async function handleDelete(userId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Failed to delete user.");
        setLoading(false);
        return;
      }
      toast.success("User deleted successfully.");
      // Refresh list
      let url = `/api/admin/users?role=${role}`;
      if (department) url += `&department=${department}`;
      if (batch && role === "student") url += `&batch=${batch}`;
      if (designation && role === "TEACHER")
        url += `&designation=${designation}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setUsers(role === "student" ? data.students : data.teachers);
          setLoading(false);
        });
    } catch {
      toast.error("Network error while deleting user.");
      setLoading(false);
    }
    setDeleteUserId(null);
  }

  const closeModal = () => {
    setEditUser(null);
    setEditData({});
    setPrograms([]);
  };

  useEffect(() => {
    if (
      editUser &&
      role === "student" &&
      (editData.departmentId || editData.department?.id)
    ) {
      const deptId = editData.departmentId || editData.department?.id;
      fetch(`/api/departments?id=${deptId}`)
        .then((res) => res.json())
        .then((data) => setPrograms(data.programs || []));
    } else {
      setPrograms([]);
    }
  }, [editUser, role, editData.departmentId, editData.department]);

  async function handleEditSave() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users/${editUser.userId || editUser.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editData, role }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "Failed to update user.");
        setLoading(false);
        return;
      }
      toast.success("User updated successfully.");
      closeModal();
      // Refresh list
      let url = `/api/admin/users?role=${role}`;
      if (department) url += `&department=${department}`;
      if (batch && role === "student") url += `&batch=${batch}`;
      if (designation && role === "teacher")
        url += `&designation=${designation}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setUsers(role === "student" ? data.students : data.teachers);
          setLoading(false);
        });
    } catch {
      toast.error("Network error while updating user.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Search Filters */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-4 mb-4">
          <Search className="w-4" />
          <Input
            placeholder="Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-[180px]"
          />
          {role === "student" && (
            <Input
              placeholder="Student ID"
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              className="w-[180px]"
            />
          )}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Funnel className="w-4" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={department || "all"}
            onValueChange={(v) => setDepartment(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Department</SelectItem>
              {departments.map((dep) => (
                <SelectItem key={dep.id} value={dep.id}>
                  {dep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {role === "student" && (
            <Select
              value={program || "all"}
              onValueChange={(v) => setProgram(v === "all" ? "" : v)}
              disabled={!department}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Program</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {role === "student" && (
            <Input
              placeholder="Batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-[120px]"
            />
          )}
          {role === "teacher" && (
            <Select
              value={designation || "all"}
              onValueChange={(v) => setDesignation(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Designation</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="Associate Professor">
                  Associate Professor
                </SelectItem>
                <SelectItem value="Assistant Professor">
                  Assistant Professor
                </SelectItem>
                <SelectItem value="Lecturer">Lecturer</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {role === "teacher" && <TableHead>Designation</TableHead>}
                {role === "student" && <TableHead>Student ID</TableHead>}
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                {role === "student" && <TableHead>Program</TableHead>}
                {role === "student" && <TableHead>Batch</TableHead>}
                {role === "student" && <TableHead>Semester</TableHead>}

                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="p-4">
              {users.map((u: any) => (
                <TableRow key={u.id || u.userId}>
                  <TableCell>{u.name}</TableCell>
                  {role === "teacher" && <TableCell>{u.designation}</TableCell>}
                  {role === "student" && <TableCell>{u.studentId}</TableCell>}
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.department?.name}</TableCell>
                  {role === "student" && (
                    <TableCell>{u.program?.name || "-"}</TableCell>
                  )}
                  {role === "student" && <TableCell>{u.batch}</TableCell>}
                  {role === "student" && (
                    <TableCell>{u.currentSemester}</TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditUser(u);
                        setEditData({ ...u });
                      }}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={loading}
                          onClick={() => setDeleteUserId(u.userId || u.id)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete this user?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button
                              variant="outline"
                              type="button"
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              type="button"
                              disabled={loading}
                              onClick={() => handleDelete(u.userId || u.id)}
                            >
                              {loading && deleteUserId === (u.userId || u.id)
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog
        open={!!editUser}
        onOpenChange={(v) => {
          if (!v) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {role === "student" ? "Student" : "Teacher"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSave();
            }}
            className="flex flex-col gap-3"
          >
            <Input
              value={editData.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              placeholder="Name"
              required
            />
            <Input
              type="email"
              value={editData.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              placeholder="Email"
              required
            />
            <Select
              value={editData.departmentId || editData.department?.id || ""}
              onValueChange={(value) =>
                setEditData({ ...editData, departmentId: value })
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
            {role === "student" && (
              <>
                <Select
                  value={editData.programId || ""}
                  onValueChange={(v) =>
                    setEditData({ ...editData, programId: v })
                  }
                >
                  <SelectTrigger id="program" className="w-full">
                    <SelectValue
                      placeholder={
                        programs.length
                          ? "Select program"
                          : "Select department first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={editData.batch || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, batch: e.target.value })
                  }
                  placeholder="Batch"
                  required
                />
                <Input
                  value={editData.studentId || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, studentId: e.target.value })
                  }
                  placeholder="Student ID"
                  required
                />
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={editData.currentSemester || 1}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      currentSemester: Number(e.target.value),
                    })
                  }
                  placeholder="Semester"
                  required
                />
              </>
            )}
            {role === "teacher" && (
              <Select
                value={editData.designation || ""}
                onValueChange={(v) =>
                  setEditData({ ...editData, designation: v })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Associate Professor">
                    Associate Professor
                  </SelectItem>
                  <SelectItem value="Assistant Professor">
                    Assistant Professor
                  </SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            )}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

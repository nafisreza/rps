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

export default function ViewUsers() {
  const [role, setRole] = useState("STUDENT");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [designation, setDesignation] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let url = `/api/admin/users?role=${role}`;
    if (department) url += `&department=${department}`;
    if (batch && role === "STUDENT") url += `&batch=${batch}`;
    if (designation && role === "TEACHER") url += `&designation=${designation}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setUsers(role === "STUDENT" ? data.students : data.teachers);
        setLoading(false);
      });
  }, [role, department, batch, designation]);

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
      if (batch && role === "STUDENT") url += `&batch=${batch}`;
      if (designation && role === "TEACHER")
        url += `&designation=${designation}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setUsers(role === "STUDENT" ? data.students : data.teachers);
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
  };

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
      if (batch && role === "STUDENT") url += `&batch=${batch}`;
      if (designation && role === "TEACHER")
        url += `&designation=${designation}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setUsers(role === "STUDENT" ? data.students : data.teachers);
          setLoading(false);
        });
    } catch {
      toast.error("Network error while updating user.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">Students</SelectItem>
            <SelectItem value="TEACHER">Teachers</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-[180px]"
        />
        {role === "STUDENT" && (
          <Input
            placeholder="Batch"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-[120px]"
          />
        )}
        {role === "TEACHER" && (
          <Input
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-[160px]"
          />
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              {role === "STUDENT" && <TableHead>Batch</TableHead>}
              {role === "STUDENT" && <TableHead>Student ID</TableHead>}
              {role === "TEACHER" && <TableHead>Designation</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id || u.userId}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.department?.name}</TableCell>
                {role === "STUDENT" && <TableCell>{u.batch}</TableCell>}
                {role === "STUDENT" && <TableCell>{u.studentId}</TableCell>}
                {role === "TEACHER" && <TableCell>{u.designation}</TableCell>}
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
      )}
      <Dialog open={!!editUser} onOpenChange={(v) => { if (!v) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {role === "STUDENT" ? "Student" : "Teacher"}
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
            <Input
              value={editData.department?.name || editData.department || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  department: {
                    ...editData.department,
                    name: e.target.value,
                  },
                  departmentId: undefined,
                })
              }
              placeholder="Department"
              required
            />
            {role === "STUDENT" && (
              <>
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
              </>
            )}
            {role === "TEACHER" && (
              <Input
                value={editData.designation || ""}
                onChange={(e) =>
                  setEditData({ ...editData, designation: e.target.value })
                }
                placeholder="Designation"
                required
              />
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

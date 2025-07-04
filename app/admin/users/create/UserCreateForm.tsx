"use client";
import { useState, useEffect } from "react";
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

type Department = { id: string; name: string };

export default function UserCreateForm() {
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [batch, setBatch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const body: any = { email, password, role, name, departmentId };
    if (role === "STUDENT") {
      body.batch = batch;
      body.studentId = studentId;
    }
    if (role === "TEACHER") {
      body.designation = designation;
    }
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("User created successfully!");
      setEmail("");
      setPassword("");
      setName("");
      setDepartmentId("");
      setBatch("");
      setStudentId("");
      setDesignation("");
    } else {
      let errorMsg = "Failed to create user.";
      try {
        const data = await res.json();
        if (data?.e?.code === "P2002") {
          if (data?.e?.meta?.target?.includes("email"))
            errorMsg = "Email is already registered.";
          else if (data?.e?.meta?.target?.includes("studentId"))
            errorMsg = "Student ID is already registered.";
          else errorMsg = "Duplicate value for a unique field.";
        } else if (data?.error) errorMsg = data.error;
      } catch {}
      toast.error(errorMsg)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="role" className="mb-1 text-sm font-medium">
            Role
          </label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="user@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1 text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="text"
            placeholder="strongPassword123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="department" className="mb-1 text-sm font-medium">
            Department
          </label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger id="department" className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role === "STUDENT" && (
          <>
            <div className="flex flex-col">
              <label htmlFor="batch" className="mb-1 text-sm font-medium">
                Batch
              </label>
              <Input
                id="batch"
                type="text"
                placeholder="e.g. 2022"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="studentId" className="mb-1 text-sm font-medium">
                Student ID
              </label>
              <Input
                id="studentId"
                type="text"
                placeholder="e.g. 220042168"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
          </>
        )}
        {role === "TEACHER" && (
          <div className="flex flex-col">
            <label htmlFor="designation" className="mb-1 text-sm font-medium">
              Designation
            </label>
            <Select value={designation} onValueChange={setDesignation}>
              <SelectTrigger id="designation" className="w-full">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROFESSOR">Professor</SelectItem>
                <SelectItem value="ASSISTANT_PROFESSOR">
                  Assistant Professor
                </SelectItem>
                <SelectItem value="ASSOCIATE_PROFESSOR">
                  Associate Professor
                </SelectItem>
                <SelectItem value="LECTURER">Lecturer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}

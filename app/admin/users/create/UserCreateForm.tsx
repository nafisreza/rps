"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaRandom } from "react-icons/fa";
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
  const [showPassword, setShowPassword] = useState(false);

  // Password generator
  function generatePassword(length = 12) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }

  const [departmentId, setDepartmentId] = useState("");
  const [batch, setBatch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [currentSemester, setCurrentSemester] = useState(0);
  const [designation, setDesignation] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [programId, setProgramId] = useState("");

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []));
  }, []);

  useEffect(() => {
    if (role === "STUDENT" && departmentId) {
      fetch(`/api/departments?id=${departmentId}`)
        .then((res) => res.json())
        .then((data) => setPrograms(data.programs || []));
    } else {
      setPrograms([]);
      setProgramId("");
    }
  }, [role, departmentId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const body: any = { email, password, role, name, departmentId };
    if (role === "STUDENT") {
      body.batch = batch;
      body.studentId = studentId;
      body.currentSemester = currentSemester;
      body.programId = programId;
    }
    if (role === "TEACHER") {
      body.designation = designation;
      body.code = teacherCode;
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
      setProgramId("");
      setTeacherCode("");
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
      toast.error(errorMsg);
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
            placeholder="email@iut-dhaka.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="mb-1 text-sm font-medium flex items-center justify-between"
          >
            <span>Password</span>
            <button
              type="button"
              className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
              onClick={() => setPassword(generatePassword())}
              title="Generate strong password"
            >
              <FaRandom className="inline-block" /> Generate
            </button>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="strongPassword123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
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
              <label htmlFor="program" className="mb-1 text-sm font-medium">
                Program
              </label>
              <Select value={programId} onValueChange={setProgramId}>
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
            </div>

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
            <div className="flex flex-col">
              <label
                htmlFor="currentSemester"
                className="mb-1 text-sm font-medium"
              >
                Semester
              </label>
              <Input
                id="currentSemester"
                type="number"
                min={1}
                max={8}
                placeholder="e.g. 4"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
                required
              />
            </div>
          </>
        )}
        {role === "TEACHER" && (
          <>
            <div className="flex flex-col">
              <label htmlFor="teacherCode" className="mb-1 text-sm font-medium">
                Teacher Code
              </label>
              <Input
                id="teacherCode"
                type="text"
                placeholder="e.g. AA"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="designation" className="mb-1 text-sm font-medium">
                Designation
              </label>
              <Select value={designation} onValueChange={setDesignation}>
                <SelectTrigger id="designation" className="w-full">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Assistant Professor">
                    Assistant Professor
                  </SelectItem>
                  <SelectItem value="Associate Professor">
                    Associate Professor
                  </SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
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

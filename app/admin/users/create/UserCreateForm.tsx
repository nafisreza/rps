"use client";
import { useState, useEffect } from "react";

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
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/departments")
      .then(res => res.json())
      .then(data => setDepartments(data.departments || []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
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
      setMessage("User created successfully!");
      setEmail("");
      setPassword("");
      setName("");
      setDepartmentId("");
      setBatch("");
      setStudentId("");
      setDesignation("");
    } else {
      setMessage("Failed to create user.");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <select value={role} onChange={e => setRole(e.target.value)} className="border rounded px-3 py-2">
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </select>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
          required
        />
      </div>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <select
          value={departmentId}
          onChange={e => setDepartmentId(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
          required
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        {role === "STUDENT" && (
          <>
            <input
              type="text"
              placeholder="Batch (e.g. 2022)"
              value={batch}
              onChange={e => setBatch(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
              required
            />
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
              required
            />
          </>
        )}
        {role === "TEACHER" && (
          <select
            value={designation}
            onChange={e => setDesignation(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            required
          >
            <option value="">Select Designation</option>
            <option value="PROFESSOR">Professor</option>
            <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
            <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
            <option value="LECTURER">Lecturer</option>
          </select>
        )}
      </div>
        <div>
              <button
        type="submit"
        className="bg-sky-700 text-white px-6 py-2 rounded hover:bg-sky-800 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create User"}
      </button>
        </div>
      {message && <div className="text-sm text-center mt-2">{message}</div>}
    </form>
  );
}

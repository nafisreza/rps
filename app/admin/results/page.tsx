'use client'

import { useState, useEffect, useRef } from "react";
import { FileDown, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminResultsPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectCourseId, setRejectCourseId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");
  const reasonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/results")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      });
  }, []);

  async function handleApprove(courseId: string) {
    await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    // Refresh list
    fetch("/api/admin/results")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []));
  }

  async function handleReject(courseId: string) {
    setRejectCourseId(courseId);
    setRejectDialogOpen(true);
  }

  async function submitReject() {
    if (!rejectCourseId || !rejectReason) return;
    await fetch("/api/admin/results/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: rejectCourseId, reason: rejectReason }),
    });
    setRejectDialogOpen(false);
    setRejectReason("");
    setRejectCourseId("");
    // Refresh list
    fetch("/api/admin/results")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []));
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Submitted Results</h1>
      <table className="min-w-full bg-white rounded-xl shadow border text-sm">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Course</th>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Code</th>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Semester</th>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Dept</th>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Result</th>
            <th className="px-4 py-3 text-left font-semibold text-blue-900">Approve</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
          ) : courses.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-8 text-gray-400">No submitted results yet.</td></tr>
          ) : (
            courses.map((r: any) => (
              <tr key={r.id} className="border-b last:border-b-0">
                <td className="px-4 py-2 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-2 text-gray-800">{r.code}</td>
                <td className="px-4 py-2 text-gray-800">{r.semester}</td>
                <td className="px-4 py-2 text-gray-800">{r.department}</td>
                <td className="px-4 py-2 font-semibold text-blue-900">{r.approved ? "Approved" : (r.status === "Submitted" ? "Submitted" : "Pending")}</td>
                <td className="px-4 py-2">
                  <a href={r.lockedPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                    <FileDown className="w-4 h-4" /> PDF
                  </a>
                </td>
                <td className="px-4 py-2">
                  <button
                    className={`px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold shadow ${r.approved ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                    disabled={r.approved}
                    onClick={() => handleApprove(r.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1 inline" /> Approve
                  </button>
                  <button
                    className={`ml-2 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold shadow ${r.approved ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"}`}
                    disabled={r.approved}
                    onClick={() => handleReject(r.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1 inline" />
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submitted Result</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block font-medium mb-2">Reason for rejection:</label>
            <input
              ref={reasonInputRef}
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </div>
          <DialogFooter>
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setRejectDialogOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={submitReject}>Reject</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

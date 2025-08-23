"use client";

import { Check, Send, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { toast as sonnerToast } from "sonner";

async function fetchCourseData(courseId: string) {
  const res = await fetch(`/api/teacher/courses/${courseId}/results`, {
    cache: "no-store",
  });
  if (!res.ok) return { enrollments: [], course: { credit: 3 }, resultStatus: "PENDING" };
  const data = await res.json();
  // Fetch from CourseResultStatus for this course and semester
  let resultStatus = "PENDING";
  try {
    const statusRes = await fetch(`/api/teacher/courses/${courseId}/results/status`, { cache: "no-store" });
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      resultStatus = statusData?.status || "PENDING";
    }
  } catch {}
  return { ...data, resultStatus };
}

export default function TeacherCourseResultsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [marks, setMarks] = useState<any>({});
  const [credit, setCredit] = useState<number>(3);
  const [course, setCourse] = useState<any>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [resultStatus, setResultStatus] = useState<string>("PENDING");
  const courseInfo = course || {};

  useEffect(() => {
    (async () => {
      const { courseId } = await params;
      setCourseId(courseId);
      fetchCourseData(courseId).then(({ enrollments, course, resultStatus }) => {
        setEnrollments(enrollments);
        setCredit(course?.credit || 3);
        setCourse(course);
        setResultStatus(resultStatus || "PENDING");
        // Pre-fill marks if results exist
        const initialMarks: any = {};
        enrollments.forEach((enr: any) => {
          if (enr.results && enr.results[0])
            initialMarks[enr.id] = enr.results[0];
        });
        setMarks(initialMarks);
      });
    })();
  }, [params]);

  // Helper to sort enrollments by studentId (numeric or lexicographic)
  function getSortedEnrollments(enrollments: any[]) {
    return [...enrollments].sort((a, b) => {
      const idA = a.student.studentId || "";
      const idB = b.student.studentId || "";
      const numA = Number(idA);
      const numB = Number(idB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return idA.localeCompare(idB);
    });
  }

  async function saveMarks(submit = false) {
    if (!courseId) return;
    if (submit) {
      // Validate all students have all marks entered
      let allFilled = true;
      for (const enrollment of enrollments) {
        const m = marks[enrollment.id];
        if (
          !m ||
          [
            "attendance",
            "quiz1",
            "quiz2",
            "quiz3",
            "quiz4",
            "midterm",
            "final",
          ].some((f) => m[f] === undefined || m[f] === null || m[f] === "")
        ) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) {
        sonnerToast.error(
          "Please enter all marks for all students before submitting."
        );
        return;
      }
    }
    const res = await fetch(`/api/teacher/courses/${courseId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks, submit }),
    });
    if (res.ok) {
      sonnerToast.success(submit ? "Submitted for approval!" : "Draft saved!");
      // Refetch status from backend after save
      fetchCourseData(courseId).then(({ resultStatus }) => {
        setResultStatus(resultStatus || "PENDING");
      });
    } else {
      sonnerToast.error("Failed to save. Please try again.");
    }
  }

  async function handleDownloadPdf(type: "draft" | "locked") {
  // Download PDF from backend API using window.open to avoid double download
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const url = `${baseUrl}/api/teacher/courses/${courseId}/results/pdf?type=${type}`;
  window.open(url, "_blank");
  }

  const calculateResult = useCallback(
    (m: any) => {
      const totalMark = credit * 100;
      // Max marks for each component
      const attendanceMax = credit * 100 * 0.1;
      const quizMax = 3 * credit * 100 * 0.05;
      const midtermMax = credit * 100 * 0.25;
      const finalMax = credit * 100 * 0.5;
      // console.log("final max", finalMax);
      // console.log("quiz max", quizMax);
      // console.log("midterm max", midtermMax);
      // console.log("attendance max", attendanceMax);

      // Normalize each component by its actual max
      const attendanceMark = Math.min(m.attendance || 0, attendanceMax);
      const quizzes = [m.quiz1 || 0, m.quiz2 || 0, m.quiz3 || 0, m.quiz4 || 0]
        .sort((a, b) => b - a)
        .slice(0, 3);
      const quizMark = Math.min(quizzes.reduce((a, b) => a + b, 0), quizMax);
      const midtermMark = Math.min(m.midterm || 0, midtermMax);
      const finalMark = Math.min(m.final || 0, finalMax);
      // console.log("quiz mark", quizMark);
      // console.log("midterm mark", midtermMark);
      // console.log("attendance mark", attendanceMark);
      // console.log("final mark", finalMark);
      const total = attendanceMark + quizMark + midtermMark + finalMark;
      // console.log("total", total);
      let grade = "F",
        gradePoint = 0;
      const percent = (total / totalMark) * 100;
      // console.log("percentage", percent);
      if (percent >= 80) [grade, gradePoint] = ["A+", 4.0];
      else if (percent >= 75) [grade, gradePoint] = ["A", 3.75];
      else if (percent >= 70) [grade, gradePoint] = ["A-", 3.5];
      else if (percent >= 65) [grade, gradePoint] = ["B+", 3.25];
      else if (percent >= 60) [grade, gradePoint] = ["B", 3.0];
      else if (percent >= 55) [grade, gradePoint] = ["B-", 2.75];
      else if (percent >= 50) [grade, gradePoint] = ["C+", 2.5];
      else if (percent >= 45) [grade, gradePoint] = ["C", 2.25];
      else if (percent >= 40) [grade, gradePoint] = ["D", 2.0];
      return { total, grade, gradePoint };
    },
    [credit]
  );

  function handleMarkChange(
    enrollmentId: string,
    field: string,
    value: number
  ) {
    // Clamp values: no negative, no over max
    const min = 0;
    let max = 100;
    if (field === "attendance") {
      max = 100; // attendance is always percentage
    } else if (field.startsWith("quiz")) {
      max = credit * 100 * 0.05;
    } else if (field === "midterm") {
      max = credit * 100 * 0.25;
    } else if (field === "final") {
      max = credit * 100 * 0.5;
    }
    const safeValue = Math.max(min, Math.min(value, max));
    setMarks((prev: any) => {
      return {
        ...prev,
        [enrollmentId]: {
          ...prev[enrollmentId],
          [field]: safeValue,
        },
      };
    });
  }

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Marks Entry</h2>
      <div className="mb-4 text-right">
        <Badge
          variant={
            resultStatus === "PENDING" ? "secondary" :
            resultStatus === "DRAFT" ? "primary" :
            resultStatus === "SUBMITTED" ? "warning" :
            resultStatus === "APPROVED" ? "success" : "secondary"
          }
        >
          {resultStatus === "PENDING" && "Pending"}
          {resultStatus === "DRAFT" && "Drafted"}
          {resultStatus === "SUBMITTED" && "Waiting for approval"}
          {resultStatus === "APPROVED" && "Approved"}
        </Badge>
      </div>
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Course: {courseInfo.name || "Course"}
        </h1>
        <div className="flex flex-wrap justify-center gap-6 text-gray-700 text-base font-medium">
          {courseInfo.code && (
            <div>
              <span className="font-semibold">Code:</span> {courseInfo.code}
            </div>
          )}
          {courseInfo.semester && (
            <div>
              <span className="font-semibold">Semester:</span>{" "}
              {courseInfo.semester}
            </div>
          )}
          {courseInfo.department && (
            <div>
              <span className="font-semibold">Dept:</span>{" "}
              {courseInfo.department.name}
            </div>
          )}
          {courseInfo.program && (
            <div>
              <span className="font-semibold">Program:</span>{" "}
              {courseInfo.program.name}
            </div>
          )}
          <div>
            <span className="font-semibold">Credit:</span> {credit}
          </div>
        </div>
      </div>
      <span className="text-gray-600 text-xs mb-4">
        Enter marks of the students throughout the semester. The grade will be
        calculated automatically.
      </span>
      <div className="overflow-x-auto rounded-xl shadow border bg-white mt-2">
        <table className="min-w-full text-sm align-middle border-separate border-spacing-y-1">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Student ID
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Attendance{" "}
                <span className="text-xs text-gray-500">
                  (%)
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Quiz 1{" "}
                <span className="text-xs text-gray-500">
                  ({credit * 100 * 0.05})
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Quiz 2{" "}
                <span className="text-xs text-gray-500">
                  ({credit * 100 * 0.05})
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Quiz 3{" "}
                <span className="text-xs text-gray-500">
                  ({credit * 100 * 0.05})
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Quiz 4{" "}
                <span className="text-xs text-gray-500">
                  ({credit * 100 * 0.05})
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Midterm{" "}
                <span className="text-xs text-gray-500">
                  ({credit * 100 * 0.25})
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Final{" "}
                <span className="text-xs text-gray-500">
                  ({credit * 100 * 0.5})
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Total
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                Grade
              </th>
              <th className="px-4 py-3 text-left font-semibold text-blue-900">
                GPA
              </th>
            </tr>
          </thead>
          <tbody>
            {getSortedEnrollments(enrollments).map(
              (enrollment: any, idx: number) => {
                const m = marks[enrollment.id] || {};
                const result = calculateResult(m);
                return (
                  <tr
                    key={enrollment.id}
                    className={`transition border-b last:border-b-0 ${
                      idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                    }`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                      {enrollment.student.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800">
                      {enrollment.student.studentId || "-"}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={m.attendance ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "attendance",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={credit * 100 * 0.05}
                        value={m.quiz1 ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "quiz1",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={credit * 100 * 0.05}
                        value={m.quiz2 ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "quiz2",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={credit * 100 * 0.05}
                        value={m.quiz3 ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "quiz3",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={credit * 100 * 0.05}
                        value={m.quiz4 ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "quiz4",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={credit * 100 * 0.25}
                        value={m.midterm ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "midterm",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={credit * 100 * 0.5}
                        value={m.final ?? ""}
                        onChange={(e) =>
                          handleMarkChange(
                            enrollment.id,
                            "final",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 py-1 outline-none transition shadow-sm"
                      />
                    </td>
                    <td className="px-2 py-2 font-semibold text-blue-900">
                      {result.total.toFixed(2)}
                    </td>
                    <td className="px-2 py-2 font-semibold text-blue-900">
                      {result.grade}
                    </td>
                    <td className="px-2 py-2 font-semibold text-blue-900">
                      {result.gradePoint.toFixed(2)}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-3 justify-end text-sm">
        <div className="flex gap-4 justify-end w-full mb-2">
          <button
            type="button"
            className={`px-3 py-2 flex items-center rounded-lg font-semibold shadow-sm border text-base ${!(resultStatus === "PENDING" || resultStatus === "DRAFT") ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 cursor-pointer"}`}
            onClick={() => saveMarks(false)}
            disabled={!(resultStatus === "PENDING" || resultStatus === "DRAFT")}
          >
            <Check className="w-5 h-5 mr-2" /> Draft
          </button>
          <button
            type="button"
            className={`px-3 py-2 flex items-center rounded-lg font-semibold shadow-sm border text-base ${resultStatus !== "DRAFT" ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" : "bg-green-100 hover:bg-green-200 text-green-700 border-green-200 cursor-pointer"}`}
            onClick={() => saveMarks(true)}
            disabled={resultStatus !== "DRAFT"}
          >
            <Send className="w-5 h-5 mr-2" /> Submit
          </button>
        </div>
        <p className="text-end text-xs mt-4">Download PDF</p>
        <div className="flex gap-2 justify-end w-full">
          <button
            type="button"
            className={`px-3 py-2 flex items-center rounded-md font-medium shadow-sm border focus:outline-none focus:ring-2 text-xs ${resultStatus !== "DRAFT" ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-200 cursor-pointer'}`}
            onClick={() => handleDownloadPdf("draft")}
            disabled={resultStatus !== "DRAFT"}
          >
            <FileDown className="w-3 h-3 mr-1" /> Draft
          </button>
          <button
            type="button"
            className={`px-3 py-2 flex items-center rounded-md font-medium shadow-sm border focus:outline-none focus:ring-2 text-xs ${resultStatus !== "SUBMITTED" && resultStatus !== "APPROVED" ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-green-100 hover:bg-green-200 text-green-900 border-green-300 cursor-pointer'}`}
            onClick={() => handleDownloadPdf("locked")}
            disabled={resultStatus !== "SUBMITTED" && resultStatus !== "APPROVED"}
          >
            <FileDown className="w-3 h-3 mr-1" /> Locked
          </button>
        </div>
      </div>
    </div>
  );
}

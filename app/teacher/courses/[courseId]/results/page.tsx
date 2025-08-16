"use client";

import { Check, Send } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast as sonnerToast } from "sonner";

async function fetchCourseData(courseId: string) {
  const res = await fetch(`/api/teacher/courses/${courseId}/results`, {
    cache: "no-store",
  });
  if (!res.ok) return { enrollments: [], course: { credit: 3 } };
  return await res.json();
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
  const courseInfo = course || {};

  useEffect(() => {
    (async () => {
      const { courseId } = await params;
      setCourseId(courseId);
      fetchCourseData(courseId).then(({ enrollments, course }) => {
        setEnrollments(enrollments);
        setCredit(course?.credit || 3);
        setCourse(course);
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
    } else {
      sonnerToast.error("Failed to save. Please try again.");
    }
  }

  const calculateResult = useCallback(
    (m: any) => {
      const totalMark = credit * 100;
      const attendanceMark = ((m.attendance || 0) / 100) * (totalMark * 0.1);
      const quizzes = [m.quiz1 || 0, m.quiz2 || 0, m.quiz3 || 0, m.quiz4 || 0]
        .sort((a, b) => b - a)
        .slice(0, 3);
      const quizMark =
        (quizzes.reduce((a, b) => a + b, 0) / 300) * (totalMark * 0.15);
      const midtermMark = ((m.midterm || 0) / 100) * (totalMark * 0.25);
      const finalMark = ((m.final || 0) / 100) * (totalMark * 0.5);
      const total = attendanceMark + quizMark + midtermMark + finalMark;
      let grade = "F",
        gradePoint = 0;
      const percent = (total / totalMark) * 100;
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
    setMarks((prev: any) => {
      return {
        ...prev,
        [enrollmentId]: {
          ...prev[enrollmentId],
          [field]: value,
        },
      };
    });
  }

  return (
    <div className="mx-auto p-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Marks Entry</h2>
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
                  ({credit * 100 * 0.1})
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
                        max={credit * 100 * 0.1}
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

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-end">
        <button
          type="button"
          className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-sm transition border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onClick={() => saveMarks(false)}
        >
          <span className="inline-flex items-center gap-2">
            <Check className="w-4 h-4" />
            Save as Draft
          </span>
        </button>
        <button
          type="button"
          className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition"
          onClick={() => saveMarks(true)}
        >
          <span className="inline-flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit for Approval
          </span>
        </button>
      </div>
    </div>
  );
}

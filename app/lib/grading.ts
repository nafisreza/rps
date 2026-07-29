// Shared grading logic for the IUT Result Processing System.
// Single source of truth for marks computation, grade scale and GPA math,
// used by the teacher results API and covered directly by the unit test suite.

export interface MarksInput {
  attendance?: number;
  quiz1?: number;
  quiz2?: number;
  quiz3?: number;
  quiz4?: number;
  midterm?: number;
  final?: number;
}

export interface ComputedResult {
  attendanceMark: number;
  quizMark: number;
  midtermMark: number;
  finalMark: number;
  total: number;
  percent: number;
  grade: string;
  gradePoint: number;
}

export function gradeFromPercent(percent: number): { grade: string; gradePoint: number } {
  if (percent >= 80) return { grade: "A+", gradePoint: 4.0 };
  if (percent >= 75) return { grade: "A", gradePoint: 3.75 };
  if (percent >= 70) return { grade: "A-", gradePoint: 3.5 };
  if (percent >= 65) return { grade: "B+", gradePoint: 3.25 };
  if (percent >= 60) return { grade: "B", gradePoint: 3.0 };
  if (percent >= 55) return { grade: "B-", gradePoint: 2.75 };
  if (percent >= 50) return { grade: "C+", gradePoint: 2.5 };
  if (percent >= 45) return { grade: "C", gradePoint: 2.25 };
  if (percent >= 40) return { grade: "D", gradePoint: 2.0 };
  return { grade: "F", gradePoint: 0 };
}

export function computeAttendanceMark(attendancePercent: number, attendanceMax: number): number {
  if (attendancePercent >= 95) return attendanceMax;
  if (attendancePercent >= 90) return attendanceMax * 0.8;
  if (attendancePercent >= 80) return attendanceMax * 0.4;
  if (attendancePercent >= 75) return attendanceMax * 0.2;
  return 0;
}

export function computeCourseResult(credit: number, m: MarksInput): ComputedResult {
  const totalMark = credit * 100;
  const attendanceMax = totalMark * 0.1;
  const quizMax = 3 * credit * 100 * 0.05;
  const midtermMax = totalMark * 0.25;
  const finalMax = totalMark * 0.5;

  const attendanceMark = computeAttendanceMark(m.attendance || 0, attendanceMax);
  const quizzes = [m.quiz1 || 0, m.quiz2 || 0, m.quiz3 || 0, m.quiz4 || 0]
    .sort((a, b) => b - a)
    .slice(0, 3);
  const quizMark = Math.min(quizzes.reduce((a, b) => a + b, 0), quizMax);
  const midtermMark = Math.min(m.midterm || 0, midtermMax);
  const finalMark = Math.min(m.final || 0, finalMax);
  const total = attendanceMark + quizMark + midtermMark + finalMark;
  const percent = (total / totalMark) * 100;
  const { grade, gradePoint } = gradeFromPercent(percent);

  return { attendanceMark, quizMark, midtermMark, finalMark, total, percent, grade, gradePoint };
}

export function computeGpa(entries: { gradePoint: number; credit: number }[]): number | null {
  let totalCredits = 0;
  let weightedSum = 0;
  for (const e of entries) {
    if (typeof e.gradePoint !== "number" || typeof e.credit !== "number") continue;
    totalCredits += e.credit;
    weightedSum += e.gradePoint * e.credit;
  }
  return totalCredits > 0 ? weightedSum / totalCredits : null;
}

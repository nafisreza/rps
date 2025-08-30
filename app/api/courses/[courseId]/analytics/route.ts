import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  const courseId = params.courseId;
  if (!courseId) {
    return new Response(JSON.stringify({ error: "Missing courseId" }), { status: 400 });
  }

  // Get enrollments for the course
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: true,
      results: true,
    },
  });

  // Flatten all results
  const results = enrollments.flatMap((e: typeof enrollments[0]) => e.results);

  // Average marks
  const avgMarks = results.length > 0 ? results.reduce((sum: number, r: typeof results[0]) => sum + (r.total ?? 0), 0) / results.length : 0;

  // Pass/fail rates (assuming pass if gradePoint >= 2.0)
  const passCount = results.filter((r: typeof results[0]) => (r.gradePoint ?? 0) >= 2.0).length;
  const failCount = results.filter((r: typeof results[0]) => (r.gradePoint ?? 0) < 2.0).length;
  const passRate = results.length > 0 ? ((passCount / results.length) * 100).toFixed(2) : "0.00";
  const failRate = results.length > 0 ? ((failCount / results.length) * 100).toFixed(2) : "0.00";

  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  results.forEach((r: typeof results[0]) => {
    if (r.grade) {
      gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    }
  });

  // Assessment analytics
  type AssessmentKey = "attendance" | "quiz1" | "quiz2" | "quiz3" | "quiz4" | "midterm" | "final";
  const assessmentTypes: AssessmentKey[] = ["attendance", "quiz1", "quiz2", "quiz3", "quiz4", "midterm", "final"];
  const assessments = assessmentTypes.map((type: AssessmentKey) => {
    const avgScore = results.length > 0 ? results.reduce((sum: number, r: typeof results[0]) => sum + (r[type] ?? 0), 0) / results.length : 0;
    return { type, avgScore: avgScore.toFixed(2) };
  });

  // Student progress
  // At risk: gradePoint < 2.0
  // Top performers: highest gradePoint (top 3)
  const studentsAtRisk = enrollments
    .map((e: typeof enrollments[0]) => {
      const bestResult = e.results.reduce((best: typeof e.results[0] | null, r: typeof e.results[0]) => (r.gradePoint > (best?.gradePoint ?? -1) ? r : best), null);
      return bestResult && bestResult.gradePoint < 2.0
        ? { id: e.student.studentId, name: e.student.name, gpa: bestResult.gradePoint }
        : null;
    })
    .filter((s): s is { id: string; name: string; gpa: number } => Boolean(s));

  const topPerformers = enrollments
    .map((e: typeof enrollments[0]) => {
      const bestResult = e.results.reduce((best: typeof e.results[0] | null, r: typeof e.results[0]) => (r.gradePoint > (best?.gradePoint ?? -1) ? r : best), null);
      return bestResult
        ? { id: e.student.studentId, name: e.student.name, gpa: bestResult.gradePoint }
        : null;
    })
    .filter((s): s is { id: string; name: string; gpa: number } => Boolean(s))
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 3);

  return new Response(
    JSON.stringify({
      avgMarks: avgMarks.toFixed(2),
      passRate,
      failRate,
      gradeDistribution,
      assessments,
      studentsAtRisk,
      topPerformers,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

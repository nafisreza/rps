import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import StudentAnalyticsCharts from "./StudentAnalyticsCharts";
import TargetCGPACalculator from "./TargetCGPACalculator";

export default async function StudentAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "STUDENT") {
    redirect("/");
  }
  let semesters = [];
  let studentId = null;
  if (user?.id) {
    const studentRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/${user.id}`);
    let studentData = null;
    try {
      studentData = await studentRes.json();
    } catch {
      studentData = null;
    }
    studentId = studentData?.student?.id;
  }
  if (studentId) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/student/${studentId}/results`, { cache: "no-store" });
    const data = await res.json();
    semesters = data.semesters || [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavbar user={user} />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <StudentAnalyticsCharts semesters={semesters} />
          <TargetCGPACalculator semesters={semesters} totalSemesters={8} />
        </main>
      </div>
    </div>
  );
}

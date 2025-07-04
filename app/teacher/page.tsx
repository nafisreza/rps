import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import TeacherSidebar from "@/components/TeacherSidebar";
import TeacherNavbar from "@/components/TeacherNavbar";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "TEACHER") {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TeacherNavbar user={user} />
      <div className="flex flex-1">
        <TeacherSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-green-100 rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-2xl font-bold text-green-700">Marks Entry</span>
              <p className="text-gray-500 mt-2 text-center">
                Enter marks for students, get grade suggestions, and save drafts.
              </p>
            </div>
            <div className="bg-green-100 rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-2xl font-bold text-green-700">
                Course Overview
              </span>
              <p className="text-gray-500 mt-2 text-center">
                View assigned courses, grading policies, and student performance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-green-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Quick Actions
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Enter marks for a course</li>
                <li>View draft results</li>
                <li>Request result publishing</li>
                <li>Analyze student performance</li>
              </ul>
            </div>
            <div className="bg-white border border-green-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Notifications
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Result publishing status</li>
                <li>Admin messages</li>
                <li>Upcoming deadlines</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

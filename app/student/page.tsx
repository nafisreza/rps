import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "STUDENT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavbar user={user} />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-yellow-100 rounded-xl p-6 shadow flex flex-col items-center w-full">
              <span className="text-2xl font-bold text-yellow-700">My Results</span>
              <p className="text-gray-500 mt-2 text-center">
                View/download semester results, see grades and GPA/CGPA.
              </p>
            </div>
            <div className="bg-yellow-100 rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-2xl font-bold text-yellow-700">
                Performance Analytics
              </span>
              <p className="text-gray-500 mt-2 text-center">
                Track your progress, set CGPA targets, and get improvement tips.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-yellow-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-yellow-700 mb-2">
                Quick Actions
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Download transcript (PDF)</li>
                <li>Set CGPA target</li>
                <li>View course improvement suggestions</li>
                <li>Contact department advisor</li>
              </ul>
            </div>
            <div className="bg-white border border-yellow-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-yellow-700 mb-2">
                Notifications
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Result published alerts</li>
                <li>Admin/teacher messages</li>
                <li>Upcoming registration deadlines</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

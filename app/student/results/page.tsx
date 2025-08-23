import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";

export default async function StudentResultsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "STUDENT") {
    redirect("/");
  }
  // Fetch approved results for the student
  let results = [];
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
    results = data.results || [];
  }

  const cgpaRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/student/${studentId}/cgpa`);
    const cgpaData = await cgpaRes.json();
    const cgpa = cgpaData.cgpa;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavbar user={user} />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2">My Results</h1>
          <span className="text-sm text-gray-500">These are your results for the current semester:</span>
          <div className="my-6 w-full">
            {results.length === 0 ? (
              <p className="text-gray-500">No approved results found.</p>
            ) : (
              <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-yellow-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Course</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Code</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Credit</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Semester</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Faculty</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Grade</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r: any) => (
                    <tr key={r.course.id} className="border-b">
                      <td className="px-4 py-2 font-medium text-gray-900">{r.course.name}</td>
                      <td className="px-4 py-2">{r.course.code}</td>
                      <td className="px-4 py-2">{r.course.credit}</td>
                      <td className="px-4 py-2">{r.course.semester}</td>
                      <td className="px-4 py-2">{r.course.teacher}</td>
                      <td className="px-4 py-2 font-semibold text-yellow-900">{r.grade}</td>
                      <td className="px-4 py-2 font-semibold text-yellow-900">{r.gradePoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-sm text-gray-500 my-2">CGPA: {cgpa}</p>
        </main>
      </div>
    </div>
  );
}

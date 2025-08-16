import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "STUDENT") {
    redirect("/");
  }
  // Fetch enrolled courses for the student
  let enrolledCourses: any[] = [];
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
    const coursesRes = await fetch(`${baseUrl}/api/student/${studentId}/courses`);
    let coursesData = null;
    try {
      coursesData = await coursesRes.json();
    } catch {
      coursesData = null;
    }
    enrolledCourses = coursesData?.courses || [];
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavbar user={user} />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">My Courses</h1>
          <div className="mt-4 w-full">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Enrolled Courses</h3>
            {enrolledCourses.length === 0 ? (
              <p className="text-gray-500">No enrolled courses found.</p>
            ) : (
              <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-yellow-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Code</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Credit</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Department</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Program</th>
                    <th className="px-4 py-2 text-left font-semibold text-yellow-700">Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.map((course: any) => (
                    <tr key={course.id} className="border-b">
                      <td className="px-4 py-2 font-medium text-gray-900">{course.name}</td>
                      <td className="px-4 py-2">{course.code}</td>
                      <td className="px-4 py-2">{course.credit}</td>
                      <td className="px-4 py-2">{course.department?.name}</td>
                      <td className="px-4 py-2">{course.program?.name || '-'}</td>
                      <td className="px-4 py-2">{course.teacher?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

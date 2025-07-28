import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { SessionUser } from "@/types/session";
import { Table } from "@/components/ui/table";

export default async function TeacherCoursesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  // Fetch teacher record for this user
  let teacherId = undefined;
  if (user?.role === "TEACHER" && user?.id) {
    const teacherRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/${user.id}`
    );
    console.log("Fetching teacher data for user ID:", user.id);
    let teacherData = null;
    try {
      teacherData = await teacherRes.json();
      console.log("Teacher data:", teacherData);
    } catch (err) {
      console.log("Error parsing teacher data:", err);
      teacherData = null;
    }
    teacherId = teacherData?.teacher?.id || user.id;
  }
  // Fetch courses assigned to this teacher
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/courses?teacherId=${teacherId}`
  );
  const data = await res.json();
  const courses = data.courses || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Courses Assigned</h1>
      <div className="overflow-x-auto rounded-lg shadow border bg-white">
        <Table className="text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Credit</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Semester</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Department</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Program</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  No courses assigned.
                </td>
              </tr>
            ) : (
              courses.map((course: any) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{course.name}</td>
                  <td className="px-4 py-2">{course.code}</td>
                  <td className="px-4 py-2">{course.credit}</td>
                  <td className="px-4 py-2">{course.semester}</td>
                  <td className="px-4 py-2">{course.department?.name}</td>
                  <td className="px-4 py-2">{course.program?.name || "-"}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`/teacher/courses/${course.id}/results`}
                      className="bg-green-100 px-3 py-2 rounded-lg text-green-800 hover:bg-green-200 transition-colors"
                    >
                      Results
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

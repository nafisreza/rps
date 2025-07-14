import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { SessionUser } from "@/types/session";
import { Table } from "@/components/ui/table";

export default async function TeacherCoursesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  // Fetch courses assigned to this teacher
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/courses?teacherId=${user?.id}`
  );
  const data = await res.json();
  const courses = data.courses || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Courses Assigned</h1>
      <div className="overflow-x-auto rounded-lg shadow border bg-white">
        <Table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Code
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Credit
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Semester
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Department
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  No courses assigned.
                </td>
              </tr>
            ) : (
              courses.map((course: any) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {course.name}
                  </td>
                  <td className="px-4 py-2">{course.code}</td>
                  <td className="px-4 py-2">{course.credit}</td>
                  <td className="px-4 py-2">{course.semester}</td>
                  <td className="px-4 py-2">{course.department?.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

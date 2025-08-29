import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default async function StudentResultsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "STUDENT") {
    redirect("/");
  }
  let semesters = [];
  let currentSemester = null;
  let cgpa = null;
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
    currentSemester = data.currentSemester;
    cgpa = data.cgpa;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavbar user={user} />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2">My Results</h1>
          {/* Current semester results */}
          <span className="text-sm text-gray-500">These are your results for the current semester:</span>
          <div className="my-6 w-full">
            {semesters.length === 0 ? (
              <p className="text-gray-500">No results found.</p>
            ) : (
              (() => {
                const current = semesters.find((s: any) => s.semester === currentSemester);
                if (!current || !current.courses || current.courses.length === 0) {
                  return <p className="text-gray-500">No results for current semester.</p>;
                }
                return (
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
                      {current.courses.map((c: any) => (
                        <tr key={c.id} className="border-b">
                          <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                          <td className="px-4 py-2">{c.code}</td>
                          <td className="px-4 py-2">{c.credit}</td>
                          <td className="px-4 py-2">{currentSemester}</td>
                          <td className="px-4 py-2">{c.teacher}</td>
                          <td className="px-4 py-2 font-semibold text-yellow-900">{c.grade}</td>
                          <td className="px-4 py-2 font-semibold text-yellow-900">{c.gradePoint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()
            )}
          </div>
          <p className="text-sm text-gray-500 my-2">CGPA: {cgpa !== null ? cgpa.toFixed(2) : "N/A"}</p>
          {/* Previous semesters accordion */}
          {semesters.filter((s: any) => s.semester !== currentSemester).length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">Previous Semesters</h2>
              <Accordion type="multiple">
                {semesters.filter((s: any) => s.semester !== currentSemester).map((sem: any) => (
                  <AccordionItem key={sem.semester} value={`sem-${sem.semester}`}>
                    <AccordionTrigger>
                      Semester {sem.semester} — GPA: {sem.gpa !== null ? sem.gpa.toFixed(2) : "N/A"}
                    </AccordionTrigger>
                    <AccordionContent>
                      <table className="min-w-full text-sm border rounded-lg overflow-hidden mb-4">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Course</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Code</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Credit</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Grade</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.courses.map((c: any, idx: number) => (
                            <tr key={c.code + idx} className="border-b">
                              <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                              <td className="px-4 py-2">{c.code}</td>
                              <td className="px-4 py-2">{c.credit}</td>
                              <td className="px-4 py-2 font-semibold text-gray-900">{c.grade}</td>
                              <td className="px-4 py-2 font-semibold text-gray-900">{c.gradePoint.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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

  const current = semesters.find((s: any) => s.semester === currentSemester);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavbar user={user} />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center gap-6 mb-6">
             <h1 className="text-2xl font-bold">My Results</h1>
             <p className="py-[3px] bg-green-100 px-2 text-green-600 rounded-lg border border-green-200">CGPA: {cgpa !== null ? cgpa.toFixed(2) : "N/A"}</p>
          </div>
          {/* Current semester results */}
          <div className="flex gap-3 items-center mb-4">
            <h2 className="text-lg font-medium text-amber-900">Current Semester</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs border border-amber-200">GPA: {current?.gpa !== null ? current?.gpa.toFixed(2) : "N/A"}</span>
          </div>
          <div className="my-6 w-full">
            {semesters.length === 0 ? (
              <p className="text-gray-500">No results found.</p>
            ) : (
              (() => {
                if (!current || !current.courses || current.courses.length === 0) {
                  return <p className="text-gray-500">No results for current semester.</p>;
                }
                return (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <Table className="min-w-full text-sm border rounded-lg overflow-hidden">
                      <TableHeader className="bg-yellow-50">
                        <TableRow>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">Course</TableHead>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">Code</TableHead>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">Credit</TableHead>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">Semester</TableHead>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">Faculty</TableHead>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">Grade</TableHead>
                          <TableHead className="px-4 py-2 text-left font-semibold text-yellow-700">GPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {current.courses.map((c: any) => (
                          <TableRow key={c.id} className="border-b">
                            <TableCell className="px-4 py-2 font-medium text-gray-900">{c.name}</TableCell>
                            <TableCell className="px-4 py-2">{c.code}</TableCell>
                            <TableCell className="px-4 py-2">{c.credit}</TableCell>
                            <TableCell className="px-4 py-2">{currentSemester}</TableCell>
                            <TableCell className="px-4 py-2">{c.teacher}</TableCell>
                            <TableCell className="px-4 py-2 font-semibold text-yellow-900">{c.grade}</TableCell>
                            <TableCell className="px-4 py-2 font-semibold text-yellow-900">{c.gradePoint}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()
            )}
          </div>
          {/* Previous semesters accordion */}
          {semesters.filter((s: any) => s.semester !== currentSemester).length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4 text-amber-900">Previous Semesters</h2>
              <Accordion type="multiple">
                {semesters.filter((s: any) => s.semester !== currentSemester).map((sem: any) => (
                  <AccordionItem key={sem.semester} value={`sem-${sem.semester}`}>
                    <AccordionTrigger className="bg-gray-100 rounded-t-lg px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-start gap-4">
                      <span>Semester {sem.semester}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs border border-amber-200">GPA: {sem.gpa !== null ? sem.gpa.toFixed(2) : "N/A"}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
                        <Table className="min-w-full text-sm border rounded-lg overflow-hidden">
                          <TableHeader className="bg-gray-100">
                            <TableRow>
                              <TableHead className="px-4 py-2 text-left font-semibold text-gray-700">Course</TableHead>
                              <TableHead className="px-4 py-2 text-left font-semibold text-gray-700">Code</TableHead>
                              <TableHead className="px-4 py-2 text-left font-semibold text-gray-700">Credit</TableHead>
                              <TableHead className="px-4 py-2 text-left font-semibold text-gray-700">Grade</TableHead>
                              <TableHead className="px-4 py-2 text-left font-semibold text-gray-700">GPA</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sem.courses.map((c: any, idx: number) => (
                              <TableRow key={c.code + idx} className="border-b hover:bg-gray-200 transition">
                                <TableCell className="px-4 py-2 font-medium text-gray-900">{c.name}</TableCell>
                                <TableCell className="px-4 py-2">{c.code}</TableCell>
                                <TableCell className="px-4 py-2">{c.credit}</TableCell>
                                <TableCell className="px-4 py-2 font-semibold text-gray-900">{c.grade}</TableCell>
                                <TableCell className="px-4 py-2 font-semibold text-gray-900">{c.gradePoint}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
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

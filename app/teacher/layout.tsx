
import TeacherSidebar from "@/components/TeacherSidebar";
import TeacherNavbar from "@/components/TeacherNavbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SessionUser } from "@/types/session";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || user.role !== "TEACHER") {
    // Redirect to login or home if not authenticated or not a teacher
    return redirect("/");
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TeacherNavbar user={user} />
      <div className="flex flex-1">
        <TeacherSidebar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}



import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SessionUser } from "@/types/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || user.role !== "ADMIN") {
    // Redirect to login or home if not authenticated or not a teacher
    return redirect("/");
  }
  return (
    <div className="min-h-screen">
      <AdminNavbar user={user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}

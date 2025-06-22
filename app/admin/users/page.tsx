import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import ViewUsers from "./ViewUsers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminNavbar user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            <Link href='/admin/users/create'>
              <Button>Create User</Button>
            </Link>
          </div>
          <ViewUsers/>
        </main>
      </div>
    </div>
  );
}

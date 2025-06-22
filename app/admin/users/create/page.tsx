import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import UserCreateForm from "./UserCreateForm";
import UserImportForm from "./UserImportForm";

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
          <h1 className="text-2xl font-bold mb-6">User Management</h1>
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Create User</h2>
            <UserCreateForm />
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Import Users from CSV</h2>
            <UserImportForm />
          </div>
        </main>
      </div>
    </div>
  );
}

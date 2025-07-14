import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/types/session";
import UserCreateForm from "./UserCreateForm";
import UserImportForm from "./UserImportForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "ADMIN") {
    redirect("/");
  }
  return (

        <main className="p-4">
          <h1 className="text-2xl font-bold mb-6">Create or Import Users</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card>
              <CardHeader>
                <CardTitle>Create User</CardTitle>
              </CardHeader>
              <CardContent>
                <UserCreateForm />
              </CardContent>
            </Card>
            <Card className="h-auto">
              <CardHeader>
                <CardTitle>Import Users from CSV or Excel file</CardTitle>
              </CardHeader>
              <CardContent>
                <UserImportForm />
              </CardContent>
            </Card>
          </div>
        </main>

  );
}

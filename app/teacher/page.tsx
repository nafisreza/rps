import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SessionUser } from "@/app/types/session";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role;
  if (!session || role !== "TEACHER") {
    redirect("/");
  }
  return (
    <div style={{ padding: 32 }}>
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <p>Your role: {role}</p>
    </div>
  );
}

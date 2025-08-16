
"use client";
import { useEffect, useState } from "react";
import DashboardStatCard from "./components/DashboardStatCard";
import DashboardLinkCard from "./components/DashboardLinkCard";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    numStudents: number;
    numTeachers: number;
    numCourses: number;
    numDepartments: number;
    error: string | null;
  }>({
    numStudents: 0,
    numTeachers: 0,
    numCourses: 0,
    numDepartments: 0,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [studentsRes, teachersRes, coursesRes, departmentsRes] = await Promise.all([
          fetch("/api/admin/users?role=student"),
          fetch("/api/admin/users?role=teacher"),
          fetch("/api/admin/courses"),
          fetch("/api/departments"),
        ]);
        const studentsData = await studentsRes.json();
        const teachersData = await teachersRes.json();
        const coursesData = await coursesRes.json();
        const departmentsData = await departmentsRes.json();
        setStats({
          numStudents: studentsData?.students?.length || 0,
          numTeachers: teachersData?.teachers?.length || 0,
          numCourses: coursesData?.courses?.length || 0,
          numDepartments: departmentsData?.departments?.length || 0,
          error: null,
        });
      } catch {
        setStats((prev) => ({ ...prev, error: "Failed to fetch stats" }));
      }
    }
    fetchStats();
  }, []);

  // Determine semester
  const now = new Date();
  const month = now.getMonth() + 1;
  const semester = month >= 1 && month <= 9 ? "Summer" : "Winter";

  // Stat cards config
  const statCards = [
    {
      label: "Students",
      value: stats.numStudents,
      icon: <FaUserGraduate />,
      iconBgColor: "#67AEFF",
    },
    {
      label: "Teachers",
      value: stats.numTeachers,
      icon: <FaChalkboardTeacher />,
      iconBgColor: "#45DCBE",
    },
    {
      label: "Courses",
      value: stats.numCourses,
      icon: <FaBook />,
      iconBgColor: "#FFC267",
    },
    {
      label: "Departments",
      value: stats.numDepartments,
      icon: <FaBuilding />,
      iconBgColor: "#FF637E",
    },
    {
      label: "Semester",
      value: semester,
      icon: <FaCalendarAlt />,
      iconBgColor: "#E8988A",
    },
  ];

  // Dashboard links config
  const dashboardLinks = [
    {
      href: "/admin/users",
      title: "User Management",
      description:
        "Add, update, or remove students and teachers. Import/export data.",
      icon: <FaUsers />,
    },
    {
      href: "/admin/courses",
      title: "Course Management",
      description:
        "Manage courses, assign to departments, set credits and grading policies.",
      icon: <FaClipboardList />,
    },
    {
      href: "/admin/results",
      title: "Result Publishing",
      description:
        "Publish university results, send notifications, and generate analytics.",
      icon: <FaChartBar />,
    },
  ];

  return (
    <div className="flex flex-col p-12">
      <div className="flex flex-1">
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          {stats.error && (
            <div className="text-red-500 mb-4">{stats.error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            {statCards.map((card) => (
              <DashboardStatCard key={card.label} {...card} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {dashboardLinks.map((link) => (
              <DashboardLinkCard key={link.href} {...link} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-[#67AEFF] mb-2">
                Quick Actions
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Add new student/teacher</li>
                <li>Import students (CSV/Excel)</li>
                <li>Assign courses to teachers</li>
                <li>Publish semester results</li>
              </ul>
            </div>
            <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold text-[#67AEFF] mb-2">
                System Analytics
              </h2>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>Department-wise result summary</li>
                <li>Top performers list</li>
                <li>Recent activity overview</li>
                <li>Check statistics</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

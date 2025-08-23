import { FC } from "react";
import { HomeIcon, BookOpenIcon, ChartBarIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/teacher", icon: HomeIcon },
  { name: "Courses", href: "/teacher/courses", icon: BookOpenIcon },
  { name: "Analytics", href: "/teacher/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/teacher/settings", icon: Cog6ToothIcon },
];

const TeacherSidebar: FC = () => (
  <aside className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col py-6 px-4 sticky top-16">
    <nav className="flex flex-col gap-2">
      {navItems.map(({ name, href, icon: Icon }) => (
        <Link
          key={name}
          href={href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors font-medium"
        >
          <Icon className="h-5 w-5" />
          {name}
        </Link>
      ))}
    </nav>
  </aside>
);

export default TeacherSidebar;

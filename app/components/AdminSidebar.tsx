import { FC } from "react";
import { HomeIcon, UsersIcon, BookOpenIcon, ChartBarIcon, Cog6ToothIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Courses", href: "/admin/courses", icon: BookOpenIcon },
  { name: "Results", href: "/admin/results", icon: ClipboardDocumentListIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
];

const AdminSidebar: FC = () => (
  <aside className="w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col py-6 px-4 sticky top-16">
    <nav className="flex flex-col gap-2">
      {navItems.map(({ name, href, icon: Icon }) => (
        <Link
          key={name}
          href={href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
        >
          <Icon className="h-5 w-5" />
          {name}
        </Link>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;

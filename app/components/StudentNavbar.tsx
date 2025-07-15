'use client'

import { FC, useState } from "react";
import { SessionUser } from "@/types/session";
import { signOut } from "next-auth/react";

const StudentNavbar: FC<{ user: SessionUser | undefined }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="h-16 w-full flex items-center justify-between px-8 bg-white shadow border-b border-gray-200 z-10">
      <div className="flex items-center gap-4">
        {/* <Image src="/next.svg" alt="Logo" width={32} height={32} /> */}
        <span className="font-bold text-xl text-yellow-700">IUT RPS</span>
        <span className="ml-6 text-gray-400 text-sm">Student &gt; Dashboard</span>
      </div>
      <div className="flex items-center gap-4 relative">
        <span className="text-gray-800 text-base font-medium">Welcome, {(user?.email?.split("@")[0] || "Student")}</span>
        <button
          className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-yellow-700 font-bold text-lg">
            {user?.email?.[0]?.toUpperCase() || "S"}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-50">
            <button
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
              onClick={() => signOut()}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default StudentNavbar;

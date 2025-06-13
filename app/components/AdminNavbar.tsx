'use client'

import { FC, useState } from "react";
import { SessionUser } from "@/types/session";
import Image from "next/image";
import { signOut } from "next-auth/react";

const AdminNavbar: FC<{ user: SessionUser | undefined }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="h-16 w-full flex items-center justify-between px-8 bg-white shadow border-b border-gray-200 z-10">
      <div className="flex items-center gap-4">
        <Image src="/next.svg" alt="Logo" width={32} height={32} />
        <span className="font-bold text-xl text-indigo-700">IUT RPS</span>
        <span className="ml-6 text-gray-400 text-sm">Admin &gt; Dashboard</span>
      </div>
      <div className="flex items-center gap-4 relative">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />
        <button
          className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-indigo-700 font-bold text-lg">
            {user?.email?.[0]?.toUpperCase() || "A"}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-50">
            <button
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
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

export default AdminNavbar;

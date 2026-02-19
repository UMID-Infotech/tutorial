// src/components/admin/AdminSidebar.jsx

import { LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const AdminSidebar = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6 text-xl font-bold">Admin Dashboard</div>

      <Separator className="bg-slate-700" />

      <nav className="p-4 space-y-4">
        <NavLink
          to="/admin/dashboard"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/tenants"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          Tenants
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;

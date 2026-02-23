// src/components/tenant/AdminSidebar.jsx

import { LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const TenantSidebar = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6 text-xl font-bold">Tenant Dashboard</div>

      <Separator className="bg-slate-700" />

      <nav className="p-4 space-y-4">
        <NavLink
          to="/admin/dashboard"
          className="flex items-center gap-2 hover:text-blue-400"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
      </nav>
    </div>
  );
};

export default TenantSidebar;

// src/components/admin/AdminHeader.jsx

import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";

const AdminHeader = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Menu size={24} />
            </SheetTrigger>

            {/* Opens from TOP */}
            <SheetContent side="top" className="p-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </div>

      <div className="font-medium">
        {user?.name}
      </div>
    </header>
  );
};

export default AdminHeader;

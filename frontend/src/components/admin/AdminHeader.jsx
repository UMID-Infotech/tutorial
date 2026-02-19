// src/components/admin/AdminHeader.jsx
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Menu size={24} />
            </SheetTrigger>

            <SheetContent side="top" className="p-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="font-medium hover:opacity-80">
            {user?.name}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AdminHeader;

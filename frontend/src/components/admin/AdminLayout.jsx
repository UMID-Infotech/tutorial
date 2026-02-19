// src/components/admin/AdminLayout.jsx

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      <div className="flex flex-col flex-1">
        <AdminHeader />

        <main className="flex-1 p-6">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;

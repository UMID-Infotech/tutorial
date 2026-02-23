// src/components/tenant/AdminLayout.jsx

import TenantSidebar from "./TenantSidebar";
import TenantHeader from "./TenantHeader";
import TenantFooter from "./TenantFooter";

const TenantLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <TenantSidebar />

      <div className="flex flex-col flex-1">
        <TenantHeader />

        <main className="flex-1 p-6">
          {children}
        </main>

        <TenantFooter />
      </div>
    </div>
  );
};

export default TenantLayout;

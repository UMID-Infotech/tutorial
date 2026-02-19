// src/pages/admin/AdminDashboard.jsx

import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome Superadmin 🚀
          </h2>
          <p>This is your Superadmin Dashboard.</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;

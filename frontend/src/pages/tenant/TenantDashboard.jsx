// src/pages/tenant/TenantDashboard.jsx

import TenantLayout from "@/components/tenant/TenantLayout";
import { Card, CardContent } from "@/components/ui/card";

const TenantDashboard = () => {
  return (
    <TenantLayout>
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome Tenant 🚀
          </h2>
          <p>This is your Tenant Dashboard.</p>
        </CardContent>
      </Card>
    </TenantLayout>
  );
};

export default TenantDashboard;

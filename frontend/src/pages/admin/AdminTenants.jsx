// src/pages/admin/AdminTenants.jsx
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchTenants = async () => {
  const res = await api.get("/superadmin/tenants");
  return res.data;
};

const AdminTenants = () => {
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      if (status === "active") {
        return api.patch(`/superadmin/approve/${id}`);
      } else if (status === "blocked") {
        return api.patch(`/superadmin/block/${id}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });

      toast.success(`Tenant is now ${variables.status}`);
    },
    onError: () => {
      toast.error("Failed to update tenant status");
    },
  });

  const handleStatusChange = (tenantId, value) => {
    statusMutation.mutate({ id: tenantId, status: value });
  };

  return (
    <AdminLayout>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            Tenant Management
          </h2>

          {isLoading ? (
            <p>Loading tenants...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Tuition Name</th>
                    <th className="p-3 text-left">Owner</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Change Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant._id} className="border-t">
                      <td className="p-3">{tenant.name}</td>
                      <td className="p-3">
                        {tenant.ownerUserId?.name}
                      </td>
                      <td className="p-3">
                        {tenant.ownerUserId?.email}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            tenant.status === "active"
                              ? "bg-green-500"
                              : tenant.status === "blocked"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>

                      <td className="p-3 w-[180px]">
                        <Select
                          disabled={statusMutation.isPending}
                          defaultValue={tenant.status}
                          onValueChange={(value) =>
                            handleStatusChange(tenant._id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="active">
                              Active
                            </SelectItem>
                            <SelectItem value="blocked">
                              Blocked
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTenants;

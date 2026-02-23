//frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import PrivateRoute from "@/routes/PrivateRoute";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTenants from "./pages/admin/AdminTenants";
import TenantDashboard from "./pages/tenant/TenantDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Superadmin Routes */}
          <Route element={<PrivateRoute allowedRoles={["superadmin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tenants" element={<AdminTenants />} />
          </Route>

          {/* Tenant Routes */}
          <Route element={<PrivateRoute allowedRoles={["tenant"]} />}>
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          </Route>

          {/* Redirect old /dashboard */}
          {/* <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} /> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

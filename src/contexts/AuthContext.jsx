//frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLogOut } from "@/hooks/auth/useAuthMutations";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = () => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");

      // ❌ handle invalid values like "undefined" or null
      if (!storedUser || storedUser === "undefined") return null;

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user in sessionStorage");
      return null;
    }
  });

  const { mutate } = useLogOut();

  useEffect(() => {
    if (!user?.role) {
      document.title = "Tutorial App";
      return;
    }

    const roleLabels = {
      superadmin: "Super Admin",
      tenant: "Tenant",
      tutor: "Tutor",
      student: "Student",
    };

    const roleTitle = roleLabels[user.role] || user.role;
    document.title = `${roleTitle} - Dashboard`;
  }, [user]);

  const login = (token, userData) => {
    // ✅ ensure valid data before saving
    if (!userData) {
      toast.error("Invalid user data");
      return;
    }

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          sessionStorage.clear();
          setUser(null);
          toast.success("Logged Out Successfully");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Logout Fail");
        },
      },
    );
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

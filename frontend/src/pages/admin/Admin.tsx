import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/isadmin`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    };

    checkAuth();

    return () => {
      // Cleanup if needed
    };
  }, [navigate, location.pathname]);

  return (
    <>
      <div className="flex">
        <AdminNavbar />
        <Outlet />
      </div>
    </>
  );
}

export default Admin;

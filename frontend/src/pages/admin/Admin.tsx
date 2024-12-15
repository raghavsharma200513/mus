import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
      }
    };

    checkAuth();

    // This will run whenever the URL changes
    return () => {
      // Cleanup if needed
    };
  }, [navigate, location.pathname]); // Dependencies include navigation and URL path

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

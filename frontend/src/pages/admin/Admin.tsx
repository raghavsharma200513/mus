import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

function Admin() {
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

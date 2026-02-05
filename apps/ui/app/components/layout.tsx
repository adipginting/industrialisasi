import Header from "./header.jsx";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="p-6">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;

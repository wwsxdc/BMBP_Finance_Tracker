import React from "react";
import { useAuth } from "../hooks/useAuth";
import Menu from "./Menu";

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="layout">
      <div className="layout-content">{children}</div>
      {user && <Menu />}
    </div>
  );
};

export default Layout;

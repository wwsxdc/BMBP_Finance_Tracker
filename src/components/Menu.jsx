import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Menu.css";

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      label: "Главная",
    },
    {
      id: "balance",
      path: "/balance",
      label: "Баланс",
    },
  ];

  return (
    <div className="menu-container">
      <nav className="menu-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}

        <button className="menu-item logout" onClick={handleLogout}>
          <span className="menu-label">Выход</span>
        </button>
      </nav>
    </div>
  );
};

export default Menu;

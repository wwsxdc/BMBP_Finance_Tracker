// DashboardPage.jsx
// Страница дашборда.
// Содержит компоненты Dashboard и Menu.
// Отображается после авторизации пользователя.

import React from "react";
import Dashboard from "../components/Dashboard";
import Menu from "../components/Menu";

const DashboardPage = () => {
  return (
    <div>
      <Dashboard />
      <Menu />
    </div>
  );
};

export default DashboardPage;

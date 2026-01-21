// App.jsx
// Главный компонент приложения.
// Настраивает роутинг с использованием react-router-dom.
// Определяет маршруты: /login для авторизации, /dashboard для главной страницы.
// Оборачивает приложение в AuthProvider для управления аутентификацией.

import React from "react";
import { AuthProvider } from "./context/AuthContext";
import Auth from "./components/Auth";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Auth />
    </AuthProvider>
  );
}

export default App;

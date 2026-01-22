// AuthContext.jsx
// Контекст для управления состоянием аутентификации пользователя.
// Будет предоставлять функции для входа, выхода и проверки статуса аутентификации.
// Используется для защиты маршрутов и отображения соответствующего UI.

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    axios.defaults.withCredentials = true;

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`);
        setUser(response.data);
      } catch (error) {
        console.log("No active session:", error.message);
        Cookies.remove("token");
        delete axios.defaults.headers.common["Authorization"];
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      if (!email?.trim()) {
        return { success: false, error: "Введите email" };
      }
      if (!password?.trim()) {
        return { success: false, error: "Введите пароль" };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Некорректный формат email" };
      }

      const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
        email: email.trim(),
        password,
      });

      if (loginResponse.data.login === true) {
        const userResponse = await axios.get(`${API_BASE_URL}/users/me`);
        setUser(userResponse.data);
      } else {
        throw new Error("Login failed");
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Ошибка входа",
      };
    }
  };

  const register = async (email, password) => {
    try {
      if (!email?.trim()) {
        return { success: false, error: "Введите email" };
      }
      if (!password?.trim()) {
        return { success: false, error: "Введите пароль" };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Некорректный формат email" };
      }

      if (password.length < 6) {
        return { success: false, error: "Пароль минимум 6 символов" };
      }
      if (password.length > 30) {
        return { success: false, error: "Пароль максимум 30 символов" };
      }

      const registerResponse = await axios.post(`${API_BASE_URL}/users`, {
        email,
        password,
      });

      const token = registerResponse.data.access_token;
      if (token) {
        Cookies.set("token", token, { expires: 7 });
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const userResponse = await axios.get(`${API_BASE_URL}/users/me`);
      setUser(userResponse.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Ошибка регистрации",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/users/logout`);
    } catch {
      // Logout error
    }
    Cookies.remove("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

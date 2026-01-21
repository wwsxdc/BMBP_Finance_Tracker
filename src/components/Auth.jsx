// Auth.jsx
// Компонент для окна регистрации и авторизации пользователя.
// Содержит формы для ввода логина/пароля, переключение между регистрацией и входом.
// Интегрируется с AuthContext для аутентификации.

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const { login, register: registerUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState("");

  return (
    <div className="auth-container">
      <div>
        <h1>BMBP - Big money for Big people</h1>
        <div className="auth-card">
          <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

          <form>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" required />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input type="password" placeholder="••••••••" required />
            </div>

            <button type="submit" className="submit-btn">
              {isLogin ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="link-btn"
              >
                {isLogin ? "Регистрация" : "Вход"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

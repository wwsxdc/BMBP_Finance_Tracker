// Auth.jsx
// Компонент для окна регистрации и авторизации пользователя.
// Содержит формы для ввода логина/пароля, переключение между регистрацией и входом.
// Интегрируется с AuthContext для аутентификации.

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Auth = () => {
  const { login, register: registerUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (isLoading) return;

    setIsLoading(true);
    setAuthError("");

    try {
      if (isLogin) {
        const result = await login(data.email, data.password);
        if (!result.success) {
          setAuthError(result.error);
        }
      } else {
        const result = await registerUser(data.email, data.password);
        if (!result.success) {
          setAuthError(result.error);
        }
      }
      reset();
    } catch (error) {
      setAuthError("Произошла ошибка");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div>
        <h1>BMBP Finance Tracker</h1>
        <div className="auth-card">
          <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Email</label>
              <input
                {...register("email", {
                  required: "Email обязателен",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                    message: "Некорректный email",
                  },
                })}
                type="email"
                placeholder="your@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                {...register("password", {
                  required: "Пароль обязателен",
                  minLength: {
                    value: 6,
                    message: "Минимум 6 символов",
                  },
                  ...(isLogin
                    ? {}
                    : {
                        maxLength: {
                          value: 30,
                          message: "Максимум 30 символов",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message:
                            "Пароль должен содержать буквы верхнего и нижнего регистра и цифры",
                        },
                      }),
                })}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error">{errors.password.message}</span>
              )}
            </div>

            {authError && <div className="error-message">{authError}</div>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading
                ? "Загрузка..."
                : isLogin
                ? "Войти"
                : "Создать аккаунт"}
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

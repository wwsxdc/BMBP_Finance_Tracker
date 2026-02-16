import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useBalance } from "../hooks/finance/useBalance";
import { getTransactionsForAccount } from "../services/api/financeApi";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { accounts, loading, error } = useBalance();
  const [accountId, setAccountId] = useState("");
  const [period, setPeriod] = useState("month");
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accountId, accounts]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!accountId) return;
      setTransactionsLoading(true);
      setTransactionsError("");
      try {
        const data = await getTransactionsForAccount(accountId);
        setTransactions(data || []);
      } catch (err) {
        setTransactionsError(err.message || "Ошибка загрузки транзакций");
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId]);

  const { chartPoints, rangeTransactions } = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    const days =
      period === "week"
        ? 7
        : period === "month"
          ? 30
          : period === "quarter"
            ? 90
            : 365;
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const filtered = transactions.filter((tx) => {
      if (!tx?.date) return false;
      const txDate = new Date(tx.date);
      return txDate <= now;
    });

    const allSorted = [...filtered].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return aDate - bDate;
    });

    const inRange = allSorted.filter((tx) => {
      if (!tx?.date) return false;
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });

    let running = 0;
    const points = [];
    allSorted.forEach((tx) => {
      const amount = Number(tx.amount || 0);
      if (tx.type === "income") {
        running += Math.abs(amount);
      } else if (tx.type === "expense") {
        running -= Math.abs(amount);
      } else {
        running += amount;
      }

      const txDate = new Date(tx.date);
      if (txDate < startDate || txDate > now) return;

      points.push({
        key: txDate.toISOString(),
        balance: Number(running.toFixed(2)),
      });
    });

    return { chartPoints: points, rangeTransactions: inRange };
  }, [transactions, period]);

  const maxValue = useMemo(() => {
    const max = chartPoints.reduce(
      (acc, point) => Math.max(acc, Math.abs(point.balance)),
      0
    );
    return max === 0 ? 1 : max;
  }, [chartPoints]);

  const sortedTransactions = useMemo(() => {
    return [...rangeTransactions].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return bDate - aDate;
    });
  }, [rangeTransactions]);

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("ru-RU");
  };

  const formatShortDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  };

  if (loading) {
    return <div className="dashboard-page">Загрузка...</div>;
  }

  if (error && accounts.length === 0) {
    return <div className="dashboard-page">{error}</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="dashboard-page">
        <h2>Нет счетов</h2>
        <p>Создайте счет на странице баланса.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Аналитика</h1>
        <div className="dashboard-controls">
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="period-buttons">
          <button
            type="button"
            className={period === "week" ? "active" : ""}
            onClick={() => setPeriod("week")}
          >
            Неделя
          </button>
          <button
            type="button"
            className={period === "month" ? "active" : ""}
            onClick={() => setPeriod("month")}
          >
            Месяц
          </button>
          <button
            type="button"
            className={period === "quarter" ? "active" : ""}
            onClick={() => setPeriod("quarter")}
          >
            3 месяца
          </button>
          <button
            type="button"
            className={period === "year" ? "active" : ""}
            onClick={() => setPeriod("year")}
          >
            Год
          </button>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-legend">
          <div className="legend-scale">Макс: {maxValue} ₽</div>
        </div>
        <div className="chart">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartPoints} margin={{ left: 8, right: 12 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis
                dataKey="key"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                width={48}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value) => [`${value} ₽`, ""]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Баланс"
                stroke="#1f4b99"
                strokeWidth={2}
                dot={{ r: 4, fill: "#1f4b99" }}
                activeDot={{ r: 6 }}
                label={{ position: "top", fill: "#111827", fontSize: 11 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-transactions">
        <h2>Транзакции за период</h2>
        {transactionsLoading && <div>Загрузка...</div>}
        {transactionsError && (
          <div className="dashboard-error">{transactionsError}</div>
        )}
        {!transactionsLoading && !transactionsError && (
          <ul className="transaction-list">
            {sortedTransactions.length === 0 ? (
              <li className="transaction-item transaction-item--empty">
                Транзакций нет
              </li>
            ) : (
              sortedTransactions.map((transaction) => (
                <li key={transaction.id} className="transaction-item">
                  <div className="transaction-item__type">
                    {transaction.type === "income"
                      ? "Доход"
                      : transaction.type === "expense"
                        ? "Расход"
                        : "Перевод"}
                  </div>
                  <div className="transaction-item__amount">
                    {transaction.amount ?? "—"} ₽
                  </div>
                  <div className="transaction-item__date">
                    {formatDate(transaction.date)}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

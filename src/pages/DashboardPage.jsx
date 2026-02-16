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

  const { chartPoints, rangeTransactions, granularity } = useMemo(() => {
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

    const granularityValue =
      period === "week" ? "day" : period === "month" ? "week" : "month";

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
    let runningAtStart = 0;
    const bucketBalances = new Map();

    const getBucketKey = (date) => {
      if (granularityValue === "day") {
        return date.toISOString().slice(0, 10);
      }
      if (granularityValue === "week") {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        const day = normalized.getDay() || 7;
        normalized.setDate(normalized.getDate() - (day - 1));
        return normalized.toISOString().slice(0, 10);
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    };

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
      if (txDate < startDate) {
        runningAtStart = running;
        return;
      }
      if (txDate > now) return;

      const bucketKey = getBucketKey(txDate);
      bucketBalances.set(bucketKey, Number(running.toFixed(2)));
    });

    const buildRange = () => {
      const range = [];
      if (granularityValue === "day") {
        const current = new Date(startDate);
        current.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(0, 0, 0, 0);
        while (current <= end) {
          range.push(getBucketKey(current));
          current.setDate(current.getDate() + 1);
        }
        return range;
      }
      if (granularityValue === "week") {
        const current = new Date(startDate);
        current.setHours(0, 0, 0, 0);
        const day = current.getDay() || 7;
        current.setDate(current.getDate() - (day - 1));
        const end = new Date(now);
        end.setHours(0, 0, 0, 0);
        while (current <= end) {
          range.push(getBucketKey(current));
          current.setDate(current.getDate() + 7);
        }
        return range;
      }

      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      while (current <= end) {
        range.push(getBucketKey(current));
        current.setMonth(current.getMonth() + 1);
      }
      return range;
    };

    const rangeKeys = buildRange();
    let lastValue = runningAtStart;
    const points = rangeKeys.map((key) => {
      if (bucketBalances.has(key)) {
        lastValue = bucketBalances.get(key);
      }
      return { key, balance: lastValue };
    });

    return {
      chartPoints: points,
      rangeTransactions: inRange,
      granularity: granularityValue,
    };
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
    if (granularity === "month") {
      const [year, month] = value.split("-");
      if (!year || !month) return value;
      return `${month}.${year.slice(2)}`;
    }
    if (granularity === "week") {
      const date = new Date(value);
      return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    }
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

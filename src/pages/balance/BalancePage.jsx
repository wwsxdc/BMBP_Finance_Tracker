import React, { useEffect, useState } from "react";
import BalanceCard from "../../components/balance/BalanceCard";
import { useBalance } from "../../hooks/finance/useBalance";
import {
  createTransaction,
  getTransactionsForAccount,
} from "../../services/api/financeApi";
import "./BalancePage.css";

const BalancePage = () => {
  const { balance, accounts, loading, error, createAccount } = useBalance();
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [transactionType, setTransactionType] = useState("income");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createAccountError, setCreateAccountError] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accountId, accounts]);

  const handleCardClick = () => {
    setShowDetails(true);
    fetchTransactions();
  };

  const fetchTransactions = async () => {
    const targetAccountId = accountId || accounts[0]?.id;
    if (!targetAccountId) return;
    setTransactionsLoading(true);
    setTransactionsError("");
    try {
      const data = await getTransactionsForAccount(targetAccountId);
      setTransactions(data || []);
    } catch (error) {
      setTransactionsError(error.message || "Ошибка загрузки транзакций");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const lastWeekTransactions = transactions.filter((transaction) => {
    if (!transaction?.date) return false;
    const txDate = new Date(transaction.date);
    return txDate >= weekAgo;
  });
  const incomeTotal = transactions.reduce((sum, transaction) => {
    if (transaction.type === "income") {
      return sum + Number(transaction.amount || 0);
    }
    return sum;
  }, 0);
  const expenseTotal = transactions.reduce((sum, transaction) => {
    if (transaction.type === "expense") {
      return sum + Math.abs(Number(transaction.amount || 0));
    }
    return sum;
  }, 0);
  const sortedLastWeek = [...lastWeekTransactions].sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    return bDate - aDate;
  });

  const handleCreateAccount = async () => {
    if (isCreatingAccount) return;
    setCreateAccountError("");
    const trimmedName = newAccountName.trim();
    if (!trimmedName) {
      setCreateAccountError("Введите название счета");
      return;
    }
    setIsCreatingAccount(true);
    const result = await createAccount(trimmedName, 0);
    if (!result.success) {
      setCreateAccountError(result.error || "Ошибка создания счета");
    } else {
      setNewAccountName("");
    }
    setIsCreatingAccount(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");
    setSubmitSuccess("");

    const parsedAmount = Number(amount);
    if (!accountId) {
      setSubmitError("Выберите счет");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setSubmitError("Введите сумму больше 0");
      return;
    }

    try {
      setIsSubmitting(true);
      const finalAmount =
        transactionType === "expense"
          ? -Math.abs(parsedAmount)
          : Math.abs(parsedAmount);
      await createTransaction({
        accountId,
        amount: finalAmount,
        type: transactionType,
      });
      setAmount("");
      setSubmitSuccess("Транзакция добавлена");
      if (showDetails) {
        fetchTransactions();
      }
    } catch (error) {
      setSubmitError(error.message || "Ошибка создания транзакции");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="balance-page">Загрузка...</div>;
  }

  if (error && accounts.length === 0) {
    return <div className="balance-page">{error}</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="balance-page">
        <div className="empty-state">
          <h2>Нет счетов</h2>
          <p>Создайте первый счет, чтобы видеть баланс и транзакции.</p>
          <input
            type="text"
            value={newAccountName}
            onChange={(event) => setNewAccountName(event.target.value)}
            placeholder="Название счета"
          />
          {createAccountError && (
            <div className="form-error">{createAccountError}</div>
          )}
          <button onClick={handleCreateAccount} disabled={isCreatingAccount}>
            {isCreatingAccount ? "Создаем..." : "Создать счет"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="balance-page">
      <BalanceCard balance={balance} onClick={handleCardClick} />

      <div className="transaction-form">
        <h2>Добавить транзакцию</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="transaction-type">Тип</label>
            <select
              id="transaction-type"
              value={transactionType}
              onChange={(event) => setTransactionType(event.target.value)}
            >
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="account-select">Счет</label>
            <select
              id="account-select"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              disabled={accounts.length === 0}
            >
              {accounts.length === 0 ? (
                <option value="">Нет счетов</option>
              ) : (
                accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="amount-input">Сумма</label>
            <div className="amount-input">
              {transactionType === "expense" && (
                <span className="amount-sign">−</span>
              )}
              <input
                id="amount-input"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => {
                  const { value } = event.target;
                  if (!value) {
                    setAmount("");
                    return;
                  }
                  const numericValue = Number(value);
                  if (!numericValue) {
                    setAmount(value);
                    return;
                  }
                  setAmount(String(Math.abs(numericValue)));
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          {submitError && <div className="form-error">{submitError}</div>}
          {submitSuccess && <div className="form-success">{submitSuccess}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Добавление..." : "Добавить"}
          </button>
        </form>
      </div>

      {showDetails && (
        <div className="balance-modal">
          <div className="balance-modal__content">
            <div className="balance-modal__header">
              <h2>ДОП. ИНФОРМАЦИЯ</h2>
              <button
                className="balance-modal__close"
                onClick={closeDetails}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            {transactionsLoading && <div>Загрузка...</div>}
            {transactionsError && (
              <div className="form-error">{transactionsError}</div>
            )}
            {!transactionsLoading && !transactionsError && (
              <>
                <div className="balance-stats">
                  <div className="balance-stat">
                    <div className="balance-stat__label">Доходы</div>
                    <div className="balance-stat__value">{incomeTotal} ₽</div>
                  </div>
                  <div className="balance-stat">
                    <div className="balance-stat__label">Расходы</div>
                    <div className="balance-stat__value">{expenseTotal} ₽</div>
                  </div>
                </div>

                <div className="transaction-list">
                  <h3>Транзакции за 7 дней</h3>
                  <ul>
                    {sortedLastWeek.length === 0 ? (
                      <li className="transaction-item transaction-item--empty">
                        Транзакций за неделю нет
                      </li>
                    ) : (
                      sortedLastWeek.map((transaction) => (
                        <li key={transaction.id} className="transaction-item">
                          <div className="transaction-item__type">
                            {transaction.type === "income"
                              ? "Доход"
                              : transaction.type === "expense"
                                ? "Расход"
                                : "Перевод"}
                          </div>
                          <div className="transaction-item__amount">
                            {transaction.amount} ₽
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalancePage;

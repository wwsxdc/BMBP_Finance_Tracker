import React, { useEffect, useState } from "react";
import BalanceCard from "../../components/balance/BalanceCard";
import { useBalance } from "../../hooks/finance/useBalance";
import { createTransaction } from "../../services/api/financeApi";
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

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accountId, accounts]);

  const handleCardClick = () => {
    // Здесь будет переход к детальной аналитике
  };

  const handleCreateAccount = async () => {
    if (isCreatingAccount) return;
    setCreateAccountError("");
    setIsCreatingAccount(true);
    const result = await createAccount("Основной счет", 0);
    if (!result.success) {
      setCreateAccountError(result.error || "Ошибка создания счета");
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
      await createTransaction({
        accountId,
        amount: parsedAmount,
        type: transactionType,
      });
      setAmount("");
      setSubmitSuccess("Транзакция добавлена");
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
            <input
              id="amount-input"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </div>

          {submitError && <div className="form-error">{submitError}</div>}
          {submitSuccess && (
            <div className="form-success">{submitSuccess}</div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Добавление..." : "Добавить"}
          </button>
        </form>
      </div>

      <div className="transaction-list">
        <h2>Последние транзакции</h2>
      </div>
    </div>
  );
};

export default BalancePage;

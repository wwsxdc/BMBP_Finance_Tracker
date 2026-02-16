import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  createAccount,
  updateAccountBalance,
} from "../../services/api/financeApi";

export const useBalance = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [balance, setBalance] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateBalance = (accountsList) => {
    const totalBalance = accountsList.reduce(
      (sum, account) => sum + parseFloat(account.balance || 0),
      0
    );

    return {
      totalIncome: 0,
      totalExpenses: 0,
      currentBalance: totalBalance,
    };
  };

  useEffect(() => {
    if (user?.accounts) {
      setBalance(calculateBalance(user.accounts));
      setLoading(false);
      setError(null);
    } else if (user === null) {
      setLoading(false);
      setError("Пользователь не авторизован");
    }
  }, [user]);

  const createNewAccount = async (name, initialBalance = 0) => {
    try {
      setError(null);
      await createAccount(name, initialBalance);
      if (refreshUser) {
        await refreshUser();
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateAccount = async (accountId, amount) => {
    try {
      setError(null);
      await updateAccountBalance(accountId, amount);
      if (refreshUser) {
        await refreshUser();
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    accounts: user?.accounts || [],
    balance,
    loading,
    error,
    createAccount: createNewAccount,
    updateBalance: updateAccount,
    refreshUser,
  };
};

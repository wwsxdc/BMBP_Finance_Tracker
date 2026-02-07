import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getAccounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/accounts/user/me`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Ошибка загрузки счетов");
  }
};

export const getAccount = async (accountId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Ошибка загрузки счета");
  }
};

export const createAccount = async (name, initialBalance = 0) => {
  try {
    if (!name?.trim()) {
      throw new Error("Название счета обязательно");
    }

    const response = await axios.post(`${API_BASE_URL}/accounts`, {
      name: name.trim(),
      balance: Number(initialBalance),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Ошибка создания счета");
  }
};

export const updateAccountBalance = async (accountId, amount) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/accounts/${accountId}?amount=${Number(amount)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка обновления баланса"
    );
  }
};

export const deleteAccount = async (accountId) => {
  try {
    await axios.delete(`${API_BASE_URL}/accounts/${accountId}`);
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Ошибка удаления счета");
  }
};

export const getTransactionsForAccount = async (
  accountId,
  period = "month"
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/transactions/account/${accountId}`,
      {
        params: { period },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка загрузки транзакций"
    );
  }
};

export const createTransaction = async (data) => {
  try {
    const { amount, type, categoryId, description } = data;

    if (!amount || amount <= 0) {
      throw new Error("Сумма должна быть положительной");
    }
    if (!type || !["income", "expense"].includes(type)) {
      throw new Error("Тип должен быть income или expense");
    }
    if (!categoryId) {
      throw new Error("Необходимо указать категорию");
    }

    const response = await axios.post(`${API_BASE_URL}/transactions`, {
      amount: Number(amount),
      type,
      categoryId: Number(categoryId),
      description: description || "",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка создания транзакции"
    );
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/categories`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка загрузки категорий"
    );
  }
};

export const createCategory = async (name) => {
  try {
    if (!name?.trim()) {
      throw new Error("Название категории обязательно");
    }

    const response = await axios.post(`${API_BASE_URL}/api/categories`, {
      name: name.trim(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка создания категории"
    );
  }
};

export const updateCategory = async (categoryId, name) => {
  try {
    if (!name?.trim()) {
      throw new Error("Название категории обязательно");
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/categories/${categoryId}`,
      {
        name: name.trim(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка обновления категории"
    );
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/categories/${categoryId}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка удаления категории"
    );
  }
};

export const getExpensesByCategory = async (period = "month") => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/expenses-by-category`,
      {
        params: { period },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Ошибка загрузки аналитики"
    );
  }
};

import React from "react";
import BalanceCard from "../../components/balance/BalanceCard";
import { useBalance } from "../../hooks/finance/useBalance";

const BalancePage = () => {
  const { balance } = useBalance();

  const handleCardClick = () => {
    // Здесь будет переход к детальной аналитике
  };

  return (
    <div>
      <BalanceCard balance={balance} onClick={handleCardClick} />

      <div>
        <h2>Последние транзакции</h2>
      </div>
    </div>
  );
};

export default BalancePage;

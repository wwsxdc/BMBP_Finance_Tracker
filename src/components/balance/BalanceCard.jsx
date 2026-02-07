import "./BalanceCard.css";

const BalanceCard = ({ balance, onClick }) => {
  return (
    <div className="bank-card" onClick={onClick}>
      <div className="card-header">
        <div className="card-chip"></div>
        <div className="card-logo">BMBP</div>
      </div>

      <div className="card-balance">
        <div className="balance-label">ТЕКУЩИЙ БАЛАНС</div>
        <div className="balance-amount">{balance.currentBalance} ₽</div>
      </div>

      <div className="card-footer">
        <div className="card-metrics">
          <div className="metric">
            <span className="label">Доходы:</span>
            <span className="value">{balance.totalIncome} ₽</span>
          </div>
          <div className="metric">
            <span className="label">Расходы:</span>
            <span className="value">{balance.totalExpenses} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;

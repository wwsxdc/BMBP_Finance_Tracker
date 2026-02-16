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
        <div className="dewiz">
          <div>BMBP - Big Money for Big People</div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;

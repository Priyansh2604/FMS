import { useEffect, useState } from 'react';

function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch(() => setTransactions([]));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Finance Management</h1>
        <p>Local frontend running at <strong>http://localhost:3000</strong></p>
      </header>

      <section className="dashboard">
        <div className="card">
          <h2>Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.type}</td>
                    <td>{tx.category}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;

import { useState } from 'react';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Category {
  name: string;
  icon: string;
  color: string;
  amount: number;
  budget?: number;
}

const categories: Category[] = [
  { name: 'Food & Dining', icon: 'restaurant', color: 'red', amount: 423.5, budget: 500 },
  { name: 'Transport', icon: 'directions_car', color: 'blue', amount: 187.3, budget: 250 },
  { name: 'Bills & Utilities', icon: 'receipt_long', color: 'orange', amount: 654.21, budget: 700 },
  { name: 'Entertainment', icon: 'local_activity', color: 'purple', amount: 312.0, budget: 400 },
  { name: 'Shopping', icon: 'shopping_bag', color: 'yellow', amount: 270.22 },
];

interface Merchant {
  name: string;
  amount: string;
  transactions: number;
}

const merchants: Merchant[] = [
  { name: 'Supermarket', amount: '€312.45', transactions: 8 },
  { name: 'Coffee House', amount: '€67.50', transactions: 22 },
  { name: 'Netflix', amount: '€12.99', transactions: 1 },
  { name: 'Gas Station', amount: '€145.30', transactions: 4 },
];

const getProgressColor = (amount: number, budget: number): string => {
  const ratio = amount / budget;
  if (ratio > 1) return '#f42d53';
  if (ratio >= 0.8) return '#ff8057';
  return '#4ed34e';
};

const Analytics: React.FC = () => {
  const [monthIndex, setMonthIndex] = useState(3);
  const [year, setYear] = useState(2026);

  const handlePrev = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  return (
    <Layout>
      <Divider />

      {/* Month Selector */}
      <div className='flex flex-h-center flex-v-center' style={{ gap: '20px' }}>
        <button className='no-select' style={{ color: '#ffffff' }} onClick={handlePrev}>
          <span className='material-symbols-outlined'>chevron_left</span>
        </button>
        <h1 className='title no-select' style={{ marginBottom: 0 }}>
          {months[monthIndex]} {year}
        </h1>
        <button className='no-select' style={{ color: '#ffffff' }} onClick={handleNext}>
          <span className='material-symbols-outlined'>chevron_right</span>
        </button>
      </div>

      <Divider />

      {/* Total Spending Summary */}
      <div className='center'>
        <p className='text-shadow' style={{ fontSize: '1em', opacity: 0.8 }}>
          Total Spent
        </p>
        <h1 className='text-shadow' style={{ fontSize: '3em', fontWeight: 500 }}>
          &euro;1,847.23
        </h1>
        <p className='text-shadow' style={{ color: '#4ed34e', fontSize: '0.95em' }}>
          12% less than last month
        </p>
      </div>

      <Divider />

      {/* Category Breakdown */}
      <h2 className='title no-select' style={{ fontSize: '1.3em' }}>
        Spending by Category
      </h2>
      <div className='history'>
        {categories.map((cat) => (
          <div key={cat.name} className='history-line flex flex-v-center'>
            <div
              className={`circle-icon ${cat.color} flex flex-h-center flex-v-center`}
              style={{ minWidth: '50px' }}
            >
              <span className='material-symbols-outlined' style={{ color: '#ffffff' }}>
                {cat.icon}
              </span>
            </div>
            <div className='history-line-details' style={{ flex: 1 }}>
              <div className='flex flex-space-between flex-v-center'>
                <p className='name'>{cat.name}</p>
                <p className='history-line-amount text-shadow'>
                  &euro;{cat.amount.toFixed(2)}
                  {cat.budget ? ` / €${cat.budget}` : ''}
                </p>
              </div>
              {cat.budget && (
                <div
                  style={{
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.1)',
                    width: '100%',
                    marginTop: '8px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '3px',
                      background: getProgressColor(cat.amount, cat.budget),
                      width: `${Math.min((cat.amount / cat.budget) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Top Merchants */}
      <h2 className='title no-select' style={{ fontSize: '1.3em' }}>
        Top Merchants
      </h2>
      <div className='history'>
        {merchants.map((m) => (
          <div key={m.name} className='history-line flex flex-v-center flex-space-between'>
            <p className='name'>{m.name}</p>
            <div className='right'>
              <p className='history-line-amount text-shadow'>{m.amount}</p>
              <p style={{ fontSize: '0.8em', color: '#999999' }}>
                {m.transactions} transaction{m.transactions !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Divider />
    </Layout>
  );
};

export default Analytics;

import { useState, useMemo } from 'react';

// components
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { defaultTransactions } from '../components/History/History';

const categories = ['All', 'Food', 'Travel', 'Bills', 'Entertainment'] as const;

const Transactions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredTransactions = useMemo(() => {
    return defaultTransactions.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Transactions</h1>

      <div className='transactions-search'>
        <span className='material-symbols-outlined'>search</span>
        <input
          type='text'
          placeholder='Search transactions...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className='transactions-filters'>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <Divider />

      <History detailed date='May 6' dateBalance='-€127.78' transactions={filteredTransactions} />

      <Divider />

      <History detailed date='May 5' dateBalance='-€970.23' transactions={filteredTransactions} />

      <Divider />
    </Layout>
  );
};

export default Transactions;

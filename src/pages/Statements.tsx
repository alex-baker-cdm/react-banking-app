import { useState } from 'react';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

// interfaces
interface Statement {
  id: string;
  month: string;
  year: number;
  account: string;
  accountFilter: string;
  openingBalance: string;
  closingBalance: string;
  totalIn: string;
  totalOut: string;
  transactions: number;
  categories: { name: string; amount: string }[];
}

interface Document {
  id: string;
  icon: string;
  title: string;
  date: string;
}

// mock data
const mockStatements: Statement[] = [
  {
    id: 'mar-2026-eur',
    month: 'March',
    year: 2026,
    account: 'Main - EUR',
    accountFilter: 'Main EUR',
    openingBalance: '€1,502.73',
    closingBalance: '€2,105.50',
    totalIn: '+€2,450.00',
    totalOut: '-€1,847.23',
    transactions: 34,
    categories: [
      { name: 'Food', amount: '€423.50' },
      { name: 'Bills', amount: '€654.21' },
      { name: 'Transport', amount: '€187.30' },
      { name: 'Other', amount: '€582.22' },
    ],
  },
  {
    id: 'feb-2026-eur',
    month: 'February',
    year: 2026,
    account: 'Main - EUR',
    accountFilter: 'Main EUR',
    openingBalance: '€1,890.45',
    closingBalance: '€1,502.73',
    totalIn: '+€1,800.00',
    totalOut: '-€2,187.72',
    transactions: 41,
    categories: [
      { name: 'Food', amount: '€423.50' },
      { name: 'Bills', amount: '€654.21' },
      { name: 'Transport', amount: '€187.30' },
      { name: 'Other', amount: '€582.22' },
    ],
  },
  {
    id: 'jan-2026-eur',
    month: 'January',
    year: 2026,
    account: 'Main - EUR',
    accountFilter: 'Main EUR',
    openingBalance: '€2,100.00',
    closingBalance: '€1,890.45',
    totalIn: '+€2,200.00',
    totalOut: '-€2,409.55',
    transactions: 38,
    categories: [
      { name: 'Food', amount: '€423.50' },
      { name: 'Bills', amount: '€654.21' },
      { name: 'Transport', amount: '€187.30' },
      { name: 'Other', amount: '€582.22' },
    ],
  },
];

const mockDocuments: Document[] = [
  {
    id: 'tax-2025',
    icon: 'description',
    title: '2025 Annual Tax Summary',
    date: 'Generated Jan 15, 2026',
  },
  {
    id: 'interest-2025',
    icon: 'description',
    title: 'Interest Certificate 2025',
    date: 'Generated Jan 15, 2026',
  },
];

const accountFilters = ['All Accounts', 'Main EUR', 'Savings GBP', 'Savings USD'];

const Statements: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All Accounts');
  const [expandedStatement, setExpandedStatement] = useState<string | null>(null);

  const filteredStatements =
    activeFilter === 'All Accounts'
      ? mockStatements
      : mockStatements.filter((s) => s.accountFilter === activeFilter);

  const handleStatementClick = (id: string): void => {
    setExpandedStatement(expandedStatement === id ? null : id);
  };

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Statements & Documents</h1>

      {/* Account Filter */}
      <div className='flex' style={{ gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {accountFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '8px 16px',
              borderRadius: '50em',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.85em',
              cursor: 'pointer',
              backgroundColor:
                activeFilter === filter ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Monthly Statements */}
      {filteredStatements.map((statement) => (
        <div key={statement.id} style={{ marginBottom: '15px' }}>
          <div
            className='accounts pointer'
            onClick={() => handleStatementClick(statement.id)}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStatementClick(statement.id);
              }
            }}
          >
            <div className='flex flex-space-between flex-v-center' style={{ marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '1.1em' }}>
                  {statement.month} {statement.year}
                </div>
                <div style={{ color: '#999999', fontSize: '0.9em' }}>{statement.account}</div>
              </div>
              <button
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50em',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className='material-symbols-outlined'>download</span>
              </button>
            </div>

            <div className='flex flex-space-between' style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9em' }}>Opening: {statement.openingBalance}</span>
              <span style={{ fontSize: '0.9em' }}>Closing: {statement.closingBalance}</span>
            </div>

            <div className='flex flex-space-between' style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9em', color: '#4ed34e' }}>
                Total in: {statement.totalIn}
              </span>
              <span style={{ fontSize: '0.9em', color: '#f42d53' }}>
                Total out: {statement.totalOut}
              </span>
            </div>

            <div style={{ fontSize: '0.85em', color: '#999999' }}>
              {statement.transactions} transactions
            </div>

            {/* Expandable Detail */}
            {expandedStatement === statement.id && (
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: '0.9em', marginBottom: '8px' }}>
                  Top Categories
                </div>
                <div className='flex' style={{ gap: '10px', flexWrap: 'wrap' }}>
                  {statement.categories.map((cat) => (
                    <div
                      key={cat.name}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        fontSize: '0.85em',
                      }}
                    >
                      {cat.name}: {cat.amount}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <Divider />

      {/* Documents Section */}
      <h2
        className='no-select'
        style={{ fontSize: '1.2em', fontWeight: 500, marginBottom: '15px' }}
      >
        Documents
      </h2>

      <div className='history'>
        {mockDocuments.map((doc) => (
          <div key={doc.id} className='history-line flex flex-v-center'>
            <div className='circle-icon gray flex flex-h-center flex-v-center'>
              <span className='material-symbols-outlined' style={{ color: '#ffffff' }}>
                {doc.icon}
              </span>
            </div>
            <div className='history-line-details'>
              <div className='name'>{doc.title}</div>
              <div className='time'>{doc.date}</div>
            </div>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50em',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className='material-symbols-outlined'>download</span>
            </button>
          </div>
        ))}
      </div>

      <Divider />
    </Layout>
  );
};

export default Statements;

// Home page - main dashboard view

// components
import Layout from '../components/Layout/Layout';
import Balance from '../components/Balance/Balance';
import Actions from '../components/Actions/Actions';
import History from '../components/History/History';
import Widgets from '../components/Widgets/Widgets';
import Divider from '../components/Divider/Divider';

// Test button to verify Sentry error tracking - remove after testing
const SentryTestButton: React.FC<{ label: string; variant: 'danger' | 'warning' }> = ({ label, variant }) => (
  <button
    onClick={() => {
      throw new Error('This is a test error for Sentry!');
    }}
    title='Click to trigger a Sentry test error'
    style={{
      padding: '10px 20px',
      backgroundColor: variant === 'danger' ? '#ff4444' : '#ff8800',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      margin: '10px',
    }}
  >
    {label}
  </button>
);

const Home: React.FC = () => (
  <Layout>
    <Balance balance={1325.5} currency='EURO' currencySymbol='€' />

    <SentryTestButton label='Test Sentry' variant='danger' />

    <Actions />

    <Divider />

    <History />

    <Divider />

    <Widgets />

    <Divider />
  </Layout>
);

export default Home;

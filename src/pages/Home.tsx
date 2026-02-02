// components
import Layout from '../components/Layout/Layout';
import Balance from '../components/Balance/Balance';
import Actions from '../components/Actions/Actions';
import History from '../components/History/History';
import Widgets from '../components/Widgets/Widgets';
import Divider from '../components/Divider/Divider';

// Test button to verify Sentry error tracking - remove after testing
const SentryTestButton: React.FC = () => (
  <button
    onClick={() => {
      throw new Error('This is a test error for Sentry!');
    }}
    style={{
      padding: '10px 20px',
      backgroundColor: '#ff4444',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      margin: '10px',
    }}
  >
    Test Sentry Error
  </button>
);

const Home: React.FC = () => (
  <Layout>
    <Balance balance={1325.5} currency='EURO' currencySymbol='€' />

    <SentryTestButton />

    <Actions />

    <Divider />

    <History />

    <Divider />

    <Widgets />

    <Divider />
  </Layout>
);

export default Home;

// Home page - primary user dashboard

// components
import Layout from '../components/Layout/Layout';
import Balance from '../components/Balance/Balance';
import Actions from '../components/Actions/Actions';
import History from '../components/History/History';
import Widgets from '../components/Widgets/Widgets';
import Divider from '../components/Divider/Divider';

const WelcomeBanner: React.FC = () => (
  <div
    style={{
      backgroundColor: '#e3f2fd',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '18px',
    }}
  >
    Welcome back!
  </div>
);

const Home: React.FC = () => (
  <Layout>
    <Balance balance={1325.5} currency='EURO' currencySymbol='€' />

    <WelcomeBanner />

    <Actions />

    <Divider />

    <History />

    <Divider />

    <Widgets />

    <Divider />
  </Layout>
);

export default Home;

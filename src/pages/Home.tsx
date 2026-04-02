// components
import Layout from '../components/Layout/Layout';
import Balance from '../components/Balance/Balance';
import Actions from '../components/Actions/Actions';
import History from '../components/History/History';
import Widgets from '../components/Widgets/Widgets';
import Divider from '../components/Divider/Divider';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Home: React.FC = () => (
  <Layout>
    <p
      className='text-shadow'
      style={{ textAlign: 'center', fontSize: '1.1em', marginBottom: '10px' }}
    >
      {getGreeting()}, Cenk
    </p>

    <Balance balance={1325.5} currency='EURO' currencySymbol='€' />

    <Actions />

    <Divider />

    <History />

    <Divider />

    <Widgets />

    <Divider />
  </Layout>
);

export default Home;

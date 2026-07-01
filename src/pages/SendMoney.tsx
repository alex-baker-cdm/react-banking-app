// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

// Send Money page prompting the user to select a recipient
const SendMoney: React.FC = () => (
  <Layout>
    <Divider />

    <h1 className='title no-select'>Send Money</h1>

    <p className='information text-shadow'>Select a recipient to send money to.</p>

    <Divider />
  </Layout>
);

export default SendMoney;

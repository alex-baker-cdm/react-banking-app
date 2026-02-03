import { useEffect, useState } from 'react';

import Card from '../components/Card/Card';
import Layout from '../components/Layout/Layout';
import History from '../components/History/History';
import Divider from '../components/Divider/Divider';
import { useScreenLoadMonitor } from '../hooks/useScreenLoadMonitor';

const SIMULATED_LOAD_DELAY_MS = 5000;

const Cards: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const setLoadComplete = useScreenLoadMonitor({
    screenName: 'Cards',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataLoaded(true);
    }, SIMULATED_LOAD_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      setLoadComplete();
    }
  }, [isDataLoaded, setLoadComplete]);

  if (!isDataLoaded) {
    return (
      <Layout>
        <Divider />
        <h1 className='title no-select'>Cards</h1>
        <div className='flex flex-h-center flex-v-center' style={{ minHeight: '200px' }}>
          <p>Loading cards...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Divider />

      <h1 className='title no-select'>Cards</h1>

      <div className='cards'>
        <Card
          number='5244 2150 8252 ****'
          cvcNumber='824'
          validUntil='10 / 30'
          cardHolder='CENK SARI'
        />
      </div>

      <Divider />

      <History detailed date='May 6' dateBalance='-€127.78' />

      <Divider />
    </Layout>
  );
};

export default Cards;

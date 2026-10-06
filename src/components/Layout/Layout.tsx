// components
import Header from '../Header/Header';

// interfaces
interface IProps {
  children: React.ReactNode;
}

const Layout: React.FC<IProps> = ({ children }) => (
  <div className='wf-page'>
    <Header />
    <main className='container wf-main'>{children}</main>
    <footer className='wf-footer'>
      <div className='container'>
        <p>
          Demo environment. Not affiliated with Wells Fargo &amp; Company. Equal Housing Lender.
          Deposit products offered by the demo bank, Member FDIC.
        </p>
      </div>
    </footer>
  </div>
);

export default Layout;

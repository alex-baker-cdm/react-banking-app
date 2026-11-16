// components
import Header from '../Header/Header';

// interfaces
interface IProps {
  children: React.ReactNode;
}

const Layout: React.FC<IProps> = ({ children }) => (
  <div className='sp-page'>
    <Header />
    <main className='container sp-main'>{children}</main>
    <footer className='sp-footer'>
      <div className='container'>
        <p>Demo environment with illustrative data. Not affiliated with S&amp;P Global Inc.</p>
      </div>
    </footer>
  </div>
);

export default Layout;

// components
import Header from '../Header/Header';

// interfaces
interface IProps {
  children: React.ReactNode;
}

// Wraps page content with the shared background gradient and top header
const Layout: React.FC<IProps> = ({ children }) => (
  <>
    {/* Full-screen gradient background */}
    <div className='bg' />
    <div className='content flex flex-col'>
      <div className='container'>
        <Header />
        {children}
      </div>
    </div>
  </>
);

export default Layout;

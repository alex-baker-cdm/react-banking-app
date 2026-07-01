import { Link } from 'react-router-dom';

// Renders the primary action circles for Add Money, Send, Details, and More
const Actions: React.FC = () => (
  <div className='actions flex flex-v-center flex-h-center'>
    {/* Add money action */}
    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/add' className='flex flex-v-center flex-h-center'>
        <span className='material-symbols-outlined'>add</span>
      </Link>
      <span className='text-shadow'>Add money</span>
    </div>
    {/* Send money action */}
    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/send' className='flex flex-v-center flex-h-center'>
        <span className='material-symbols-outlined'>send</span>
      </Link>
      <span className='text-shadow'>Send</span>
    </div>
    {/* Account details action */}
    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <Link to='/home' className='flex flex-v-center flex-h-center'>
        <span className='material-symbols-outlined'>page_info</span>
      </Link>
      <span className='text-shadow'>Details</span>
    </div>
    {/* More options action */}
    <div className='circle no-select flex flex-col flex-v-center flex-h-center'>
      <button type='button' className='flex flex-v-center flex-h-center'>
        <span className='material-symbols-outlined'>more_horiz</span>
      </button>
      <span className='text-shadow'>More</span>
    </div>
  </div>
);

export default Actions;

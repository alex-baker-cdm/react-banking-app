// Renders a downward arrow icon used as a visual separator between source and destination accounts
const Arrow: React.FC = () => (
  <div className='transfer-icon no-select'>
    <div className='transfer-circle flex flex-v-center flex-h-center'>
      <span className='material-symbols-outlined'>arrow_downward</span>
    </div>
  </div>
);

export default Arrow;

// interfaces
interface IProps {
  balance: number;
  currency: string;
  currencySymbol: string;
}

// Displays the user's main account balance along with the active currency label
const Balance: React.FC<IProps> = ({ balance, currency, currencySymbol }) => (
  <div className='balance flex flex-col flex-v-center flex-h-center'>
    {/* Currency selector label with a dropdown chevron icon */}
    <p className='currency text-shadow no-select flex flex-v-center flex-h-center'>
      Main - {currency}
      <span className='material-symbols-outlined'>keyboard_arrow_down</span>
    </p>
    {/* Balance amount, prefixed with the currency symbol */}
    <h1 className='text-shadow no-select flex flex-h-center flex-v-center'>
      <span>{currencySymbol}</span>
      {balance}
    </h1>
  </div>
);

export default Balance;

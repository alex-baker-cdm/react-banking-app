import { formatChange, formatMoney } from '../../api/format';
import { Company } from '../../api/types';

// interfaces
interface IProps {
  company: Company;
  onSelect?: (company: Company) => void;
}

const CompanyRow: React.FC<IProps> = ({ company, onSelect }) => (
  <li className='sp-company-row'>
    <button
      type='button'
      className='sp-company-link'
      onClick={() => onSelect?.(company)}
      aria-label={`${company.name}, rated ${company.rating}, outlook ${company.outlook}`}
    >
      <span className='sp-ticker'>{company.ticker}</span>
      <span className='sp-company-name'>{company.name}</span>
      <span className='sp-rating'>{company.rating}</span>
      <span className='sp-outlook'>{company.outlook}</span>
      <span className='sp-price right'>{formatMoney(company.price)}</span>
      <span className={`sp-change right ${company.changePct < 0 ? 'sp-down' : 'sp-up'}`}>
        {formatChange(company.changePct)}
      </span>
    </button>
  </li>
);

export default CompanyRow;

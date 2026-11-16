import { useState } from 'react';

import Dialog from './Dialog';

import { Company } from '../../api/types';

// interfaces
interface IProps {
  watchlistName: string;
  companies: Company[];
  onAdd: (company: Company) => void;
  onClose: () => void;
}

const AddCompanyDialog: React.FC<IProps> = ({ watchlistName, companies, onAdd, onClose }) => {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const matches = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(term) || company.ticker.toLowerCase().includes(term)
  );

  return (
    <Dialog title={`Add to ${watchlistName}`} onClose={onClose}>
      {companies.length === 0 ? (
        <p className='sp-muted'>All companies are already in this watchlist.</p>
      ) : (
        <>
          <input
            type='search'
            className='input'
            placeholder='Search by name or ticker'
            aria-label='Search by name or ticker'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {matches.length === 0 ? (
            <p className='sp-empty'>No companies match your search.</p>
          ) : (
            <ul className='sp-picker-list'>
              {matches.map((company) => (
                <li key={company.id}>
                  <button type='button' className='sp-picker-option' onClick={() => onAdd(company)}>
                    <span className='sp-ticker'>{company.ticker}</span>
                    <span>{company.name}</span>
                    <span className='sp-rating'>{company.rating}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <div className='sp-dialog-actions'>
        <button type='button' className='sp-button-secondary' onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
};

export default AddCompanyDialog;

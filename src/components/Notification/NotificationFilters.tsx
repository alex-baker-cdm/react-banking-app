import { NotificationCategory } from '../../types/notification';

type FilterOption = NotificationCategory | 'all';

interface IProps {
  active: FilterOption;
  onFilter: (category: FilterOption) => void;
}

const filters: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Payments', value: 'payment' },
  { label: 'Security', value: 'security' },
  { label: 'Promotions', value: 'promotion' },
];

const NotificationFilters: React.FC<IProps> = ({ active, onFilter }) => (
  <div className='notification-filters flex'>
    {filters.map((f) => (
      <button
        key={f.value}
        type='button'
        className={`notification-filter${active === f.value ? ' active' : ''}`}
        onClick={() => { onFilter(f.value); }}
      >
        {f.label}
      </button>
    ))}
  </div>
);

export default NotificationFilters;

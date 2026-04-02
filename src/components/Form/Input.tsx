// interfaces
interface IProps {
  name: string;
  type: string;
  value?: string;
  tabIndex: number;
  required?: boolean;
  placeholder: string;
  autoComplete?: string;
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  endAdornment?: React.ReactNode;
}

const Input: React.FC<IProps> = ({
  name,
  type,
  value,
  tabIndex,
  placeholder,
  required = false,
  autoComplete = 'off',
  error,
  onChange,
  endAdornment,
}) => (
  <div className='input-wrapper'>
    <div className='input-container'>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        tabIndex={tabIndex}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={onChange}
        className={`input${error ? ' input-error' : ''}`}
      />
      {endAdornment && <div className='input-end-adornment'>{endAdornment}</div>}
    </div>
    {error && <span className='input-error-message'>{error}</span>}
  </div>
);

export default Input;

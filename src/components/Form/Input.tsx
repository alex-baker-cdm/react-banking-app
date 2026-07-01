// interfaces
interface IProps {
  name: string;
  type: string;
  value?: string;
  tabIndex: number;
  required?: boolean;
  placeholder: string;
  autoComplete?: boolean;
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Renders a text input with optional validation error message
const Input: React.FC<IProps> = ({
  name,
  type,
  value,
  tabIndex,
  placeholder,
  required = false,
  autoComplete = false,
  error,
  onChange,
}) => (
  <div className='input-wrapper'>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      tabIndex={tabIndex}
      required={required}
      placeholder={placeholder}
      autoComplete={autoComplete ? 'on' : 'off'}
      onChange={onChange}
      className={`input${error ? ' input-error' : ''}`}
    />
    {error && <span className='input-error-message'>{error}</span>}
  </div>
);

export default Input;

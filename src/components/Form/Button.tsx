// interfaces
interface IProps {
  type: string;
  text: string;
  tabIndex: number;
  disabled?: boolean;
  onClick?: () => void;
}

// Renders a styled submit or action button with optional disabled state
const Button: React.FC<IProps> = ({ type, text, tabIndex, disabled = false, onClick }) => (
  <button
    tabIndex={tabIndex}
    type={type === 'submit' ? 'submit' : 'button'}
    className={`button ${disabled ? 'disabled' : 'active'}`}
    onClick={onClick}
  >
    {text}
  </button>
);

export default Button;

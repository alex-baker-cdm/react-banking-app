import { useEffect, useRef } from 'react';

// interfaces
interface IProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<IProps> = ({ title, onClose, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    (dialog?.querySelector<HTMLElement>('input, button') ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>('input, button');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, []);

  return (
    <div className='sp-backdrop'>
      <div
        ref={dialogRef}
        className='sp-dialog'
        role='dialog'
        aria-modal='true'
        aria-label={title}
        tabIndex={-1}
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Dialog;

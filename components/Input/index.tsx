import styles from "./Input.module.css";

interface InputProps {
  hint?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ placeholder, hint, ...rest }) => (
  <div>
    <input className={styles.control} placeholder={placeholder} {...rest} />
    {hint && <p className={styles.hint}>{hint}</p>}
  </div>
);

export { Input };

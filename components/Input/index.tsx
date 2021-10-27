import styles from "./Input.module.css";

interface InputProps {
  placeholder?: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({ placeholder, ...rest }) => {
  return (
    <div>
      <input className={styles.control} placeholder={placeholder} {...rest} />
    </div>
  );
};

export { Input };

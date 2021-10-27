import ReactLoading from "react-loading";

import styles from "./Button.module.css";

interface ButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  isLoading = false,
  className,
  ...rest
}) => {
  const mergedClassName = [styles.wrapper, className].join(" ");

  return (
    <div className={mergedClassName}>
      <button
        className={styles.control}
        onClick={onClick}
        {...rest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ReactLoading type="spin" color="#fff" height={20} width={20} />
        ) : (
          children
        )}
      </button>
    </div>
  );
};

export { Button };

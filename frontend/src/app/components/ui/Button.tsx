import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children = "Button", ...rest }: ButtonProps) => {
  return (
    <button type="button" {...rest}>
      {children}
    </button>
  );
};

export default Button;

import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => {
  return <input {...props} />;
};

export default Input;

import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ children, ...rest }: SelectProps) => {
  return <select {...rest}>{children}</select>;
};

export default Select;

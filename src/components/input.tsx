import type { FC, FormEvent } from "react";

interface Props {
  type?: string;
  name: string;
  placeholder?: string;
  extraClass?: string;
  required?: boolean;
  border?: string;
  id?: string;
  label?: string;
  onChange?: (e: FormEvent<HTMLInputElement>) => void;
  value?: string;
  readOnly?: boolean;
  defaultValue?: string;
  width?: string;
}

const Input: FC<Props> = ({
  type = "text",
  name,
  placeholder = "",
  required = false,
  label = "",
  onChange,
  value,
  readOnly = false,
  defaultValue,
  width = "w-full",
}) => (
  <div className={`flex flex-col gap-2 ${width}`}>
    <label htmlFor={name} className="mb-0 flex w-full text-left">
      {label}
    </label>
    <input
      type={type}
      readOnly={readOnly}
      className="border-2 border-gray-500 py-2 px-4 outline-none"
      name={name}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
      value={value}
      defaultValue={defaultValue}
      aria-label={label}
    />
  </div>
);

export default Input;

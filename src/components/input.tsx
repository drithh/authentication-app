import { type FC, type FormEvent, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
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
}) => {
  const [showPassword, setShowPassword] = useState(type !== "password");

  return (
    <div className={`relative flex flex-col gap-2 ${width}`}>
      <label htmlFor={name} className="mb-0 flex w-full text-left">
        {label}
      </label>
      <input
        type={type === "password" && !showPassword ? "password" : "text"}
        readOnly={readOnly}
        className="border-2 border-gray-500 px-4 py-2 outline-none"
        name={name}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        value={value}
        defaultValue={defaultValue}
        aria-label={label}
      />
      {type === "password" && (
        <div className="absolute bottom-3 right-3 flex cursor-pointer justify-end">
          {showPassword ? (
            <AiOutlineEye
              className="text-xl"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <AiOutlineEyeInvisible
              className="text-xl"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Input;

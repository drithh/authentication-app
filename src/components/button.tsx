import type { FC } from "react";

interface Props {
  type?: "button" | "submit" | "reset";
  extraClass?: string;
  size?: "sm" | "lg" | "xl";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

const Button: FC<Props> = ({ onClick, children, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full border-2 border-slate-700 bg-white p-2 text-xl uppercase text-slate-700 hover:bg-slate-700 hover:text-white sm:text-base"
    >
      {children}
    </button>
  );
};

export default Button;

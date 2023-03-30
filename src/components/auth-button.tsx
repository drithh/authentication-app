import Button from "./button";
import type { ReactNode } from "react";

interface AuthButton {
  icon: ReactNode;
  onClick: () => void;
}

const AuthButton = ({ icon, onClick }: AuthButton) => {
  return (
    <Button onClick={onClick}>
      <div className="flex place-content-center">{icon}</div>
    </Button>
  );
};

export default AuthButton;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../context/AuthContext";
import routes from "../_constants/routes";

interface UnAuthGuardProps {
  children: React.ReactNode;
}

const UnAuthGuard: React.FC<UnAuthGuardProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && currentUser) {
      navigate(routes.HOME);
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) {
    return <></>;
  }

  return <>{children}</>;
};

export default UnAuthGuard;

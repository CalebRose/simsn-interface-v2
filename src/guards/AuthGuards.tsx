import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../_services/auth";
import { useAuthStore } from "../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/login");
    }
    if (currentUser && currentUser.IsBanned) {
      navigate("/");
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading || !currentUser) {
    return <></>;
  }

  return <>{children}</>;
};

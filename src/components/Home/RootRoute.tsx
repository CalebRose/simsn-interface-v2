import { useAuthStore } from "../../context/AuthContext";
import { Home } from "./Home";
import { PublicLandingPage } from "./PublicLandingPage";

export const RootRoute = () => {
  const { currentUser } = useAuthStore();

  return currentUser ? <Home /> : <PublicLandingPage />;
};

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Added Route here
import { AuthRoutes } from "./AuthRoutes";
import { UnAuthRoutes } from "./UnAuthRoutes";
import { SideMenu } from "../components/SideMenu/SideMenu";
import { DeepLinkProvider } from "../context/DeepLinkContext";

function AppRoutes() {
  return (
    <Router>
      <DeepLinkProvider>
        <SideMenu />
        <Routes>
          {AuthRoutes}
          {UnAuthRoutes}
        </Routes>
      </DeepLinkProvider>
    </Router>
  );
}

export default AppRoutes;

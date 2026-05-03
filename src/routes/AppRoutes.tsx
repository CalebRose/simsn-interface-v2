import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Added Route here
import { AuthRoutes } from "./AuthRoutes";
import { UnAuthRoutes } from "./UnAuthRoutes";
import { SideMenu } from "../components/SideMenu/SideMenu";
import { DeepLinkProvider } from "../context/DeepLinkContext";
import LiveRink from '../components/LiveScoreboard/LiveRink';

function AppRoutes() {
  return (
    <Router basename="/simsn-interface-v2">
      <DeepLinkProvider>
        <SideMenu />
        <Routes>
          {AuthRoutes}
          {UnAuthRoutes}
          {/* Add our LiveRink testing route right here */}
          <Route path="/live-rink" element={<LiveRink />} />
        </Routes>
      </DeepLinkProvider>
    </Router>
  );
}

export default AppRoutes;

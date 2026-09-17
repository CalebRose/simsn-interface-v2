import { useMemo } from "react";
import { AdminPageProvider } from "./context/AdminPageContext";
import { AuthProvider, useAuthStore } from "./context/AuthContext";
import { LeagueProvider } from "./context/LeagueContext";
import { SimBaseballProvider } from "./context/SimBaseballContext";
import { SimBBAProvider } from "./context/SimBBAContext";
import { SimFBAProvider } from "./context/SimFBAContext";
import { SimHCKProvider } from "./context/SimHockeyContext";
import { SimLAXProvider } from "./context/SimLAXContext";
import { ForumProvider } from "./context/ForumContext";
import { DMProvider } from "./context/DMContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

const InnerApp = () => {
  const { viewMode, isLoading, isDarkMode, currentUser } = useAuthStore();
  const overallTheme = useMemo(() => {
    if (isDarkMode) {
      return "dark";
    }
    return "light";
  }, [isDarkMode]);

  if (isLoading) return null;
  return (
    <div className={overallTheme}>
      <SimLAXProvider>
        <SimFBAProvider>
          <SimBBAProvider>
            <SimHCKProvider>
              <SimBaseballProvider>
                <LeagueProvider>
                  <AdminPageProvider>
                    <ForumProvider currentUser={currentUser}>
                      <DMProvider currentUser={currentUser}>
                        <AppRoutes />
                      </DMProvider>
                    </ForumProvider>
                  </AdminPageProvider>
                </LeagueProvider>
              </SimBaseballProvider>
            </SimHCKProvider>
          </SimBBAProvider>
        </SimFBAProvider>
      </SimLAXProvider>
    </div>
  );
};

export default App;

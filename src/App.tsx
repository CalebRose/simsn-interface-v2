import { AdminPageProvider } from "./context/AdminPageContext";
import { AuthProvider, useAuthStore } from "./context/AuthContext";
import { LeagueProvider } from "./context/LeagueContext";
import { SimBaseballProvider } from "./context/SimBaseballContext";
import { SimBBAProvider } from "./context/SimBBAContext";
import { SimFBAProvider } from "./context/SimFBAContext";
import { SimHCKProvider } from "./context/SimHockeyContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

const InnerApp = () => {
  const { viewMode, isLoading } = useAuthStore();
  if (isLoading) return null;
  return (
    <div className={viewMode}>
      <SimFBAProvider>
        <SimBBAProvider>
          <SimHCKProvider>
            <SimBaseballProvider>
              <LeagueProvider>
                <AdminPageProvider>
                  <AppRoutes />
                </AdminPageProvider>
              </LeagueProvider>
            </SimBaseballProvider>
          </SimHCKProvider>
        </SimBBAProvider>
      </SimFBAProvider>
    </div>
  );
};

export default App;
